const { Listener } = require('@eartharoid/dbf');
const crypto = require('crypto');
const {
	getAvgResolutionTime,
	getAvgResponseTime,
} = require('../../lib/stats');
const ms = require('ms');
const { version } = require('../../../package.json');
const { msToMins } = require('../../lib/misc');
const sync = require('../../lib/sync');
const checkForUpdates = require('../../lib/updates');
const { isStaff } = require('../../lib/users');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');

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

		// fill cache
		await sync(client);

		if (process.env.PUBLISH_COMMANDS === 'true') {
			client.log.info('Automatically publishing commands...');
			client.commands.publish()
				.then(commands => client.log.success('Published %d commands', commands?.size))
				.catch(client.log.error);
		}

		if (process.env.PUBLIC_BOT === 'true' && !client.application.botPublic) {
			client.log.warn('The `PUBLIC_BOT` environment variable is set to `true`, but the bot is not public.');
		} else if (process.env.PUBLIC_BOT === 'false' && client.application.botPublic) {
			client.log.warn('Your bot is public, but public features are disabled. Set the `PUBLIC_BOT` environment variable to `true`, or make your bot private.');
		}

		// commands are not cached automatically
		await client.application.commands.fetch();

		// presence/activity
		let next = 0;
		const setPresence = async () => {
			const cacheKey = 'cache/presence';
			let cached = await client.keyv.get(cacheKey);
			if (!cached) {
				const tickets = await client.prisma.ticket.findMany({
					select: {
						closedAt: true,
						createdAt: true,
						firstResponseAt: true,
					},
				});
				const closedTickets = tickets.filter(t => t.firstResponseAt && t.closedAt);
				cached = {
					avgResolutionTime: ms(getAvgResolutionTime(closedTickets)),
					avgResponseTime: ms(getAvgResponseTime(closedTickets)),
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

		if (client.config.updates) {
			checkForUpdates(client);
			setInterval(() => checkForUpdates(client), ms('1w'));
		}

		// send inactivity warnings and close stale tickets
		const staleInterval = ms('5m');
		setInterval(async () => {
			// close stale tickets
			for (const [ticketId, $] of client.tickets.$stale) {
				const autoCloseAfter = $.closeAt - $.staleSince;
				const halfway = $.closeAt - (autoCloseAfter / 2);
				if (Date.now() >= halfway && Date.now() < halfway + staleInterval) {
					const channel = client.channels.cache.get(ticketId);
					if (!channel) continue;
					const { guild } = await client.prisma.ticket.findUnique({
						select: { guild: true },
						where: { id: ticketId },
					});
					const getMessage = client.i18n.getLocale(guild.locale);
					await channel.send({
						embeds: [
							new ExtendedEmbedBuilder()
								.setColor(guild.primaryColour)
								.setTitle(getMessage('ticket.closing_soon.title'))
								.setDescription(getMessage('ticket.closing_soon.description', { timestamp: Math.floor($.closeAt / 1000) })),
						],
					});
				} else if ($.closeAt < Date.now()) {
					client.tickets.finallyClose(ticketId, $.reason);
				}
			}

			const guilds = await client.prisma.guild.findMany({
				include: {
					tickets: {
						include: { category: true },
						where: { open: true },
					},
				},
				// where: { staleAfter: { not: null } },
				where: { staleAfter: { gte: staleInterval } },
			});

			// set inactive tickets as stale
			for (const guild of guilds) {
				for (const ticket of guild.tickets) {
					if (client.tickets.$stale.has(ticket.id)) continue;
					if (ticket.lastMessageAt && Date.now() - ticket.lastMessageAt > guild.staleAfter) {
					/** @type {import("discord.js").TextChannel} */
						const channel = client.channels.cache.get(ticket.id);
						const messages = (await channel.messages.fetch({ limit: 5 })).filter(m => m.author.id !== client.user.id);
						let ping = '';

						if (messages.size > 0) {
							const lastMessage = messages.first();
							if(lastMessage.author.bot) return;
							const staff = await isStaff(channel.guild, lastMessage.author.id);
							if (staff) ping = lastMessage.author.toString();
							else ping = ticket.category.pingRoles.map(r => `<@&${r}>`).join(' ');
						}

						const getMessage = client.i18n.getLocale(guild.locale);
						const closeComamnd = client.application.commands.cache.find(c => c.name === 'close');
						const sent = await channel.send({
							components: [
								new ActionRowBuilder()
									.addComponents(
										new ButtonBuilder()
											.setCustomId(JSON.stringify({ action: 'close' }))
											.setStyle(ButtonStyle.Danger)
											.setEmoji(getMessage('buttons.close.emoji'))
											.setLabel(getMessage('buttons.close.text')),
									),
							],
							content: ping,
							embeds: [
								new ExtendedEmbedBuilder({
									iconURL: channel.guild.iconURL(),
									text: guild.footer,
								})
									.setColor(guild.primaryColour)
									.setTitle(getMessage('ticket.inactive.title'))
									.setDescription(getMessage('ticket.inactive.description', {
										close: `</${closeComamnd.name}:${closeComamnd.id}>`,
										timestamp: Math.floor(ticket.lastMessageAt.getTime() / 1000),
									})),
							],
						});

						client.tickets.$stale.set(ticket.id, {
							closeAt: guild.autoClose ? Date.now() + guild.autoClose : null,
							closedBy: null,
							message: sent,
							messages: 0,
							reason: 'inactivity',
							staleSince: Date.now(),
						});
					}
				}
			}
		}, staleInterval);
	}
};
