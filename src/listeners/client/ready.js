const { Listener } = require('@eartharoid/dbf');
const ms = require('ms');
const sync = require('../../lib/sync');
const checkForUpdates = require('../../lib/updates');
const {
	getAverageTimes,
	getAverageRating,
	sendToHouston,
} = require('../../lib/stats');
const handleStaleTickets = require('../../lib/stale');

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
		client.log.success('Connected to Discord as "%s" over %d shards', client.user.tag, client.ws.shards.size);

		await client.initAfterLogin();

		// fill cache
		await sync(client);

		if (process.env.PUBLISH_COMMANDS === 'true') {
			client.log.info('Automatically publishing commands...');
			client.commands.publish()
				.then(commands => client.log.success('Published %d commands', commands?.size))
				.catch(client.log.error);
		}

		await client.application.fetch();
		if (process.env.PUBLIC_BOT === 'true' && !client.application.botPublic) {
			client.log.warn('The `PUBLIC_BOT` environment variable is set to `true`, but the bot is not public.');
		} else if (process.env.PUBLIC_BOT !== 'true' && client.application.botPublic) {
			client.log.warn('Your bot is public, but public features are disabled. Set the `PUBLIC_BOT` environment variable to `true`, or make your bot private.');
		}

		// commands are not cached automatically
		await client.application.commands.fetch();

		// presence/activity
		if (client.config.presence.activities?.length > 0) {
			let next = 0;
			const setPresence = async () => {
				client.log.verbose.cron('Updating presence');
				const cacheKey = 'cache/presence';
				let cached = await client.keyv.get(cacheKey);
				if (!cached) {
					const tickets = await client.prisma.ticket.findMany({
						select: {
							closedAt: true,
							createdAt: true,
							feedback: { select: { rating: true } },
							firstResponseAt: true,
						},
					});
					const closedTickets = tickets.filter(t => t.closedAt);
					const closedTicketsWithResponse = closedTickets.filter(t => t.firstResponseAt);
					const {
						avgResolutionTime,
						avgResponseTime,
					} = await getAverageTimes(closedTicketsWithResponse);
					const avgRating = await getAverageRating(closedTickets);

					cached = {
						avgRating: avgRating.toFixed(1),
						avgResolutionTime: ms(avgResolutionTime),
						avgResponseTime: ms(avgResponseTime),
						guilds: client.guilds.cache.size,
						openTickets: tickets.length - closedTickets.length,
						totalTickets: tickets.length,
					};
					await client.keyv.set(cacheKey, cached, ms('15m'));
				}
				const activity = { ...client.config.presence.activities[next] };
				activity.name = activity.name
					.replace(/{+avgResolutionTime}+/gi, cached.avgResolutionTime)
					.replace(/{+avgResponseTime}+/gi, cached.avgResponseTime)
					.replace(/{+avgRating}+/gi, cached.avgRating)
					.replace(/{+guilds}+/gi, cached.guilds)
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
		} else {
			client.log.info('Presence activities are disabled');
		}

		// stats posting
		if (client.config.stats) {
			sendToHouston(client);
			setInterval(() => sendToHouston(client), ms('12h'));
		}

		if (client.config.updates) {
			checkForUpdates(client);
			setInterval(() => checkForUpdates(client), ms('1w'));
		}

		if (process.env.PUBLIC_BOT === 'true') {
			client.log.notice('Inactivity warnings and auto-close features are disabled');
			client.log.warn('Unset PUBLIC_BOT to re-enable stale ticket handling');
		} else {
			// send inactivity warnings and close stale tickets
			const staleInterval = ms('15m');
			setInterval(() => handleStaleTickets(client, staleInterval), staleInterval);
		}
	}
};
