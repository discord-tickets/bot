module.exports.getAvgResolutionTime = tickets => (tickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) || 1) / Math.max(tickets.length, 1);
module.exports.getAvgResponseTime = tickets => (tickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) || 1) / Math.max(tickets.length, 1);
