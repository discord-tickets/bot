const { Listener } = require('@eartharoid/dbf');
const crypto = require('crypto');
const ms = require('ms');
const { version } = require('../../../package.json');
const { msToMins } = require('../../lib/misc');
const sync = require('../../lib/sync');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'ready',
			once: true,
		});
	}

	async run() {
		/** @type {import("client")} */
		const client = this.client;

		// process.title = `"[Discord Tickets] ${client.user.tag}"`; // too long and gets cut off
		process.title = 'tickets';
		client.log.success('Connected to Discord as "%s"', client.user.tag);

		await sync(client);

		// presence/activity
		let next = 0;
		const setPresence = async () => {
			const cacheKey = 'cache/presence';
			let cached = await client.keyv.get(cacheKey);
			if (!cached) {
				const tickets = await client.prisma.ticket.findMany({
					select: {
						createdAt: true,
						firstResponseAt: true,
					},
				});
				const closedTickets = tickets.filter(t => t.closedAt);
				cached = {
					avgResolutionTime: ms(closedTickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) ?? 1 / closedTickets.length),
					avgResponseTime: ms(closedTickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) ?? 1 / closedTickets.length),
					openTickets: tickets.length - closedTickets.length,
					totalTickets: tickets.length,
				};
				await client.keyv.set(cacheKey, cached, ms('15m'));
			}
			const activity = client.config.presence.activities[next];
			activity.name = activity.name
				.replace(/{+avgResolutionTime}+/gi, cached.avgResolutionTime)
				.replace(/{+avgResponseTime}+/gi, cached.avgResponseTime)
				.replace(/{+openTickets}+/gi, cached.openTickets)
				.replace(/{+totalTickets}+/gi, cached.totalTickets);
			client.user.setPresence({
				activities: [activity],
				status: client.config.presence.status,
			});
			next++;
			if (next === client.config.presence.activities.length) next = 0;
		};
		setPresence();
		if (client.config.presence.activities.length > 1) setInterval(() => setPresence(), client.config.presence.interval * 1000);

		// stats posting
		if (client.config.stats) {
			const send = async () => {
				const tickets = await client.prisma.ticket.findMany({
					select: {
						createdAt: true,
						firstResponseAt: true,
					},
				});
				const closedTickets = tickets.filter(t => t.closedAt);
				const users = await client.prisma.user.findMany({ select: { messageCount: true } });
				const stats = {
					activated_users: users.length,
					arch: process.arch,
					avg_resolution_time: msToMins(closedTickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) ?? 1 / closedTickets.length),
					avg_response_time: msToMins(closedTickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) ?? 1 / closedTickets.length),
					categories: await client.prisma.category.count(),
					database: process.env.DB_PROVIDER,
					guilds: client.guilds.cache.size,
					id: crypto.createHash('md5').update(client.user.id).digest('hex'),
					members: client.guilds.cache.reduce((t, g) => t + g.memberCount, 0),
					messages: users.reduce((total, user) => total + user.messageCount, 0), // don't count archivedMessage table rows, they can be deleted,
					node: process.version,
					os: process.platform,
					tags: await client.prisma.tag.count(),
					tickets: tickets.length,
					version,
				};
				try {
					const res = await fetch('https://stats.discordtickets.app/api/v3/houston', {
						body: JSON.stringify(stats),
						headers: { 'content-type': 'application/json' },
						method: 'POST',
					});
					if (!res.ok) throw res;
					client.log.success('Posted client stats');
					client.log.verbose(stats);
					client.log.debug(res);
				} catch (res) {
					client.log.error('An error occurred whilst posting stats', (await res.json())?.error);
					client.log.debug(res);
				}
			};
			send();
			setInterval(() => send(), ms('12h'));
		}

		setInterval(() => {
			// TODO: check lastMessageAt and set stale
			// this.$stale.set(ticket.id, {
			// 	closeAt: ticket.guild.autoClose ? Date.now() + ticket.guild.autoClose : null,
			// 	closedBy: null, // null if set as stale due to inactivity
			// 	message: sent,
			// 	messages: 0,
			// 	reason: 'inactivity',
			// 	staleSince: Date.now(),
			// });

			for (const [ticketId, $] of client.tickets.$stale) {
				// ⌛
			}
		}, ms('5m'));
	}
};
