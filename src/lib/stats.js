/* eslint-disable no-underscore-dangle */

const {
	spawn,
	Pool,
	Worker,
} = require('threads');
const { cpus } = require('node:os');
const { version } = require('../../package.json');
const { md5 } = require('./misc');

// ! ceiL: at least 1
const poolSize = Math.ceil(cpus().length / 4);
const pool = Pool(() => spawn(new Worker('./workers/stats.js')), { size: poolSize });

module.exports.getAvgResolutionTime = tickets => (tickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) || 1) / Math.max(tickets.length, 1);

module.exports.getAvgResponseTime = tickets => (tickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) || 1) / Math.max(tickets.length, 1);

/**
 *
 * @param {import("../client")} client
 */
module.exports.sendToHouston = async client => {
	const guilds = await client.prisma.guild.findMany({
		include: {
			categories: { include: { _count: { select: { questions: true } } } },
			tags: true,
			tickets: {
				select: {
					closedAt: true,
					createdAt: true,
					firstResponseAt: true,
				},
			},
		},
	});
	const users = (await client.prisma.user.aggregate({
		_count: true,
		_sum: { messageCount: true },
	}));
	const messages = users._sum.messageCount ?? 0;
	const stats = {
		activated_users: users._count,
		arch: process.arch,
		database: process.env.DB_PROVIDER,
		guilds: guilds
			.filter(guild => client.guilds.cache.has(guild.id))
			.map(async guild => {
				guild.members = client.guilds.cache.get(guild.id).memberCount;
				return pool.queue(worker => worker.aggregateGuildForHouston(guild, messages));
			}),
		id: md5(client.user.id),
		node: process.version,
		os: process.platform,
		version,
	};

	const delta = guilds.length - stats.guilds.length;
	if (delta !== 0) {
		client.log.warn('%d guilds are not cached and were excluded from the stats report', delta);
	}

	try {
		client.log.verbose('Reporting to Houston:', stats);
		const res = await fetch('https://stats.discordtickets.app/api/v4/houston', {
			body: JSON.stringify(stats),
			headers: { 'content-type': 'application/json' },
			method: 'POST',
		});
		if (!res.ok) throw res;
		client.log.success('Posted client stats');
		client.log.debug(res);
	} catch (res) {
		client.log.warn('The following error is not important and can be safely ignored');
		try {
			const json = await res.json();
			client.log.error('An error occurred whilst posting stats:', json);
		} catch (error) {
			client.log.error('An error occurred whilst posting stats and the response couldn\'t be parsed:', error.message);
		}
		client.log.debug(res);
	}
};
