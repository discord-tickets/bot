/* eslint-disable no-underscore-dangle */

const { expose } = require('threads/worker');
const { createHash } = require('crypto');

const md5 = str => createHash('md5').update(str).digest('hex');

const msToMins = ms => Number((ms / 1000 / 60).toFixed(2));

const getAvgResolutionTime = tickets => (tickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) || 1) / Math.max(tickets.length, 1);

const getAvgResponseTime = tickets => (tickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) || 1) / Math.max(tickets.length, 1);

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
	getAvgResolutionTime,
	getAvgResponseTime,
});
