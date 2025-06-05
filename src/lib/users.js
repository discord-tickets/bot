const fs = require('fs');
const { Readable } = require('stream');
const path = require('path');
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

/**
 *
 * @param {import("discord.js").GuildMember} member
 * @returns {{hash: string, url: string, isAnimated: boolean} | false}
 */
module.exports.getAvatarData = member => {
	if (!member?.user) return false;

	const { avatar: userAvatar } = member.user;
	const memberAvatar = member.avatar;

	const avatarHash = memberAvatar || userAvatar;
	if (!avatarHash) return false;

	const isAnimated = avatarHash.startsWith('a_');

	const url = memberAvatar
		? member.avatarURL()
		: member.user.avatarURL();

	return {
		hash: avatarHash,
		isAnimated,
		url,
	};
};

/**
 *
 * @param {{url: string, hash: string}} avatar
 * @returns {Promise<string | false>} - The filename of the saved avatar if successful, `false` if failed.
 */
module.exports.saveAvatar = async avatar => {
	const avatarDir = path.join('user', 'avatars');

	if (!avatar?.url || !avatar.hash) return false;

	const ext = path.extname(avatar.url);
	const filename = `${avatar.hash}${ext}`;
	const filePath = path.join(avatarDir, filename);

	try {
		await fs.promises.access(filePath);
		return filename; // Avatar already saved
	} catch (err) {
		if (err.code !== 'ENOENT') {
			return false;
		}
	}

	const res = await fetch(avatar.url);
	if (!res.ok) {
		return false;
	}

	const nodeReadable = Readable.fromWeb(res.body);
	const writeStream = fs.createWriteStream(filePath);

	return new Promise((resolve, reject) => {
		nodeReadable.pipe(writeStream);
		writeStream.on('finish', () => resolve(filename));
		writeStream.on('error', () => reject(false));
	});
};
