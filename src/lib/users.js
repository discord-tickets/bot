const { PermissionsBitField } = require('discord.js');

/**
 *
 * @param {import("discord.js").Client} client
 * @param {string} userId
 * @returns {Promise<Collection<import("discord.js").Guild>}
 */
module.exports.getCommonGuilds = (client, userId) => client.guilds.cache.filter(guild => guild.members.cache.has(userId));

/**
 * @param {import("discord.js").Guild} guild
 * @returns {Promise<string[]>}
 */
const updateStaffRoles = async guild => {
	const { categories } = await guild.client.prisma.guild.findUnique({
		select: { categories: { select: { staffRoles: true } } },
		where: { id: guild.id },
	});
	const staffRoles = [
		...new Set(
			categories.reduce((acc, c) => {
				acc.push(...c.staffRoles);
				return acc;
			}, []),
		),
	];
	await guild.client.keyv.set(`cache/guild-staff:${guild.id}`, staffRoles);
	return staffRoles;
};

module.exports.updateStaffRoles = updateStaffRoles;

/**
 *
 * @param {import("discord.js").Guild} guild
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
module.exports.isStaff = async (guild, userId) => {
	/** @type {import("client")} */
	const client = guild.client;
	if (client.supers.includes(userId)) return true;
	const guildMember = guild.members.cache.get(userId) || await guild.members.fetch(userId);
	if (guildMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
	const staffRoles = await client.keyv.get(`cache/guild-staff:${guild.id}`) || await updateStaffRoles(guild);
	return staffRoles.some(r => guildMember.roles.cache.has(r));
};
