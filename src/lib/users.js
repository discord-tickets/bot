const {
	ApplicationCommandPermissionType,
	PermissionsBitField,
} = require('discord.js');

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
 * @param {import("discord.js").Guild} guild
 * @param {string} token
 * @param {string[]} [staffRoles]
 * @returns {Promise<any>}
 */
const updateCommandPermissions = async (guild, token, staffRoles) => {
	const client = guild.client;
	staffRoles ??= await updateStaffRoles(guild);
	return Promise.all([
		'Create ticket for user',
		'claim',
		'force-close',
		'move',
		'priority',
		'release',
	].map(name => {
		const command = client.application.commands.cache.find(cmd => cmd.name === name);
		if (!command) return;
		return client.application.commands.permissions.set({
			command,
			guild,
			permissions: [
				{
					id: guild.id, // @everyone
					permission: false,
					type: ApplicationCommandPermissionType.Role,
				},
				...staffRoles.map(id => ({
					id,
					permission: true,
					type: ApplicationCommandPermissionType.Role,
				})),
			],
			token,
		});
	}))
		.then(() => client.log.success('Updated application command permissions in "%s"', guild.name))
		.catch(error => client.log.error(error));
};

module.exports.updateCommandPermissions = updateCommandPermissions;

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
	try {
		const guildMember = guild.members.cache.get(userId) || await guild.members.fetch(userId);
		if (guildMember.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
		const staffRoles = await client.keyv.get(`cache/guild-staff:${guild.id}`) || await updateStaffRoles(guild);
		return staffRoles.some(r => guildMember.roles.cache.has(r));
	} catch {
		return false;
	}
};

/**
 *
 * @param {import("discord.js")} member
 * @returns {Promise<number>}
 * 	- `4` = OPERATOR (SUPER)
 *  - `3` = GUILD_OWNER
 *  - `2` = GUILD_ADMIN
 *  - `1` = GUILD_STAFF
 *  - `0` = GUILD_MEMBER
 *  - `-1` = NONE (NOT A MEMBER)
 */
module.exports.getPrivilegeLevel = async member => {
	if (!member) return -1;
	else if (member.guild.client.supers.includes(member.id)) return 4;
	else if (member.guild.ownerId === member.id) return 3;
	else if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return 2;
	else if (await this.isStaff(member.guild, member.id)) return 1;
	else return 0;
};
