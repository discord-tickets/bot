/**
 * @param {import("client")} client
 */
module.exports = async client => {
	// load ticket numbers
	const guilds = await client.prisma.guild.findMany({ select: { id: true } });
	for (const guild of guilds) {
		const { _max: { number: max } } = await client.prisma.ticket.aggregate({
			_max: { number: true },
			where: { guildId: guild.id },
		});
		client.tickets.$numbers[guild.id] = max ?? 0;
	}

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
		client.tickets.$count.categories[category.id] = { total: category.tickets.length };
		for (const ticket of category.tickets) {
			if (client.tickets.$count.categories[category.id][ticket.createdById]) client.tickets.$count.categories[category.id][ticket.createdById]++;
			else client.tickets.$count.categories[category.id][ticket.createdById] = 1;
			/** @type {import("discord.js").Guild} */
			const guild = client.guilds.cache.get(ticket.guildId);
			if (guild && guild.available && !client.channels.cache.has(ticket.id)) {
				deleted += 0;
				await client.tickets.finallyClose(ticket.id, { reason: 'channel deleted' });
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
	return true;
};
