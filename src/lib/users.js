/**
 *
 * @param {import("client")} client
 * @param {string} userId
 * @returns {Promise<Collection<import("discord.js").Guild>}
 */
module.exports.getCommonGuilds = async (client, userId) => await client.guilds.cache.filter(async guild => {
	const member = await guild.members.fetch(userId);
	return !!member;
});

/**
 *
 * @param {import("discord.js").Guild} guild
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
module.exports.isStaff = async (guild, userId) => {
	/** @type {import("client")} */
	const client = guild.client;
	if (guild.client.supers.includes(userId)) return true;
	const guildMember = await guild.members.fetch(userId);
	if (guildMember?.permissions.has('MANAGE_GUILD')) return true;
	const { categories } = await client.prisma.guild.findUnique({
		select: { categories: true },
		where: { id: guild.id },
	});
	return categories.some(cat => cat.roles.some(r => guildMember.roles.cache.has(r)));
};