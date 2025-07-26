/* eslint-disable no-underscore-dangle */

const { expose } = require('threads/worker');
const { createHash } = require('crypto');

const md5 = str => createHash('md5').update(str).digest('hex');

const msToMins = ms => Number((Number(ms) / 1000 / 60).toFixed(2));

const reduce = (closedTickets, prop) => closedTickets.reduce((total, ticket) => total + (ticket[prop] - ticket.createdAt), 0) || 1;

const getAvgResolutionTime = closedTickets => reduce(closedTickets, 'closedAt') / Math.max(closedTickets.length, 1);

const getAvgResponseTime = closedTickets => reduce(closedTickets, 'firstResponseAt') / Math.max(closedTickets.length, 1);

const sum = numbers => numbers.reduce((t, n) => t + n, 0);

const getAvgRating = closedTickets => {
	const ratings = closedTickets
		.map(t => t.feedback?.rating)
		.filter(r => typeof r === 'number');
	return (sum(ratings) || 0) / Math.max(ratings.length, 1);
};

expose({
	aggregateGuildForHouston(guild, messages) {
		const closedTickets = guild.tickets.filter(t => t.firstResponseAt && t.closedAt);
		return {
			avg_resolution_time: msToMins(getAvgResolutionTime(closedTickets)),
			avg_response_time: msToMins(getAvgResponseTime(closedTickets)),
			categories: guild.categories.length,
			features: {
				auto_close: msToMins(guild.autoClose),
				claiming: guild.categories.filter(c => c.claiming).length,
				feedback: guild.categories.filter(c => c.enableFeedback).length,
				logs: !!guild.logChannel,
				questions: guild.categories.filter(c => c._count.questions).length,
				tags: guild.tags.length,
				tags_regex: guild.tags.filter(t => t.regex).length,
				topic: guild.categories.filter(c => c.requireTopic).length,
			},
			id: md5(guild.id),
			locale: guild.locale,
			members: guild.members,
			messages, // * global not guild, don't count archivedMessage table rows, they can be deleted
			tickets: guild.tickets.length,
		};
	},
	getAvgRating,
	getAvgResolutionTime,
	getAvgResponseTime,
	sum,
});
