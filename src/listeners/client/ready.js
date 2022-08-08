const { Listener } = require('@eartharoid/dbf');
const ms = require('ms');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'ready',
			once: true,
		});
	}

	run() {
		// process.title = `"[Discord Tickets] ${this.client.user.tag}"`; // too long and gets cut off
		process.title = 'tickets';
		this.client.log.success('Connected to Discord as "%s"', this.client.user.tag);

		let next = 0;
		const setPresence = async () => {
			const cacheKey = 'cache/presence';
			let cached = await this.client.keyv.get(cacheKey);

			if (!cached) {
				const tickets = await this.client.prisma.ticket.findMany({
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
				await this.client.keyv.set(cacheKey, cached, ms('15m'));
			}
			const activity = this.client.config.presence.activities[next];
			activity.name = activity.name
				.replace(/{+avgResolutionTime}+/gi, cached.avgResolutionTime)
				.replace(/{+avgResponseTime}+/gi, cached.avgResponseTime)
				.replace(/{+openTickets}+/gi, cached.openTickets)
				.replace(/{+totalTickets}+/gi, cached.totalTickets);
			this.client.user.setPresence({
				activities: [activity],
				status: this.client.config.presence.status,
			});
			next++;
			if (next === this.client.config.presence.activities.length) next = 0;

		};

		setPresence();
		if (this.client.config.presence.activities.length > 1) setInterval(() => setPresence(), this.client.config.presence.interval * 1000);
	}
};
