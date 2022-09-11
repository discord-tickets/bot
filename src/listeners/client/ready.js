const { Listener } = require('@eartharoid/dbf');
const md5 = require('md5');
const ms = require('ms');
const { version } = require('../../../package.json');
const { msToMins } = require('../../lib/misc');

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

		// load total number of open tickets
		const categories = await client.prisma.category.findMany({
			select: {
				cooldown: true,
				id: true,
				tickets: {
					select: {
						createdById: true,
						guildId: true,
						id: true,
					},
					where: { open: true },
				},
			},
		});
		let deleted = 0;
		let ticketCount = 0;
		let cooldowns = 0;
		for (const category of categories) {
			ticketCount += category.tickets.length;
			client.tickets.$.categories[category.id] = { total: category.tickets.length };
			for (const ticket of category.tickets) {
				if (client.tickets.$.categories[category.id][ticket.createdById]) client.tickets.$.categories[category.id][ticket.createdById]++;
				else client.tickets.$.categories[category.id][ticket.createdById] = 1;
				/** @type {import("discord.js").Guild} */
				const guild = client.guilds.cache.get(ticket.guildId);
				if (guild && guild.available && !client.channels.cache.has(ticket.id)) {
					deleted += 0;
					await client.tickets.close(ticket.id);
				}

			}
			if (category.cooldown) {
				const recent = await client.prisma.ticket.findMany({
					orderBy: { createdAt: 'asc' },
					select: {
						createdAt: true,
						createdById: true,
					},
					where: {
						categoryId: category.id,
						createdAt: { gt: new Date(Date.now() - category.cooldown) },
					},
				});
				cooldowns += recent.length;
				for (const ticket of recent) {
					const cacheKey = `cooldowns/category-member:${category.id}-${ticket.createdById}`;
					const expiresAt = ticket.createdAt.getTime() + category.cooldown;
					const TTL = expiresAt - Date.now();
					await client.keyv.set(cacheKey, expiresAt, TTL);
				}
			}
		}
		// const ticketCount = categories.reduce((total, category) => total + category.tickets.length, 0);
		client.log.info(`Cached ticket count of ${categories.length} categories (${ticketCount} open tickets)`);
		client.log.info(`Loaded ${cooldowns} active cooldowns`);
		client.log.info(`Closed ${deleted} deleted tickets`);

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
					id: md5(client.user.id),
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
				} catch (error) {
					client.log.error('An error occurred whilst posting stats', stats, error);
				}
			};

			send();
			setInterval(() => send(), ms('12h'));
		}
	}
};
