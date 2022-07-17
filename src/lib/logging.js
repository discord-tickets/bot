const { MessageEmbed } = require('discord.js');
const { diff: getDiff } = require('object-diffy');

function makeDiff({
	original, updated,
}) {
	const diff = getDiff(original, updated);
	const fields = [];
	for (const key in diff) {
		if (key === 'createdAt') continue; // object-diffy doesn't like dates
		fields.push({
			name: key,
			value: `\`\`\`diff\n${diff[key].from && `- ${diff[key].from}\n`}\n${diff[key].to && `+ ${diff[key].to}\n`}\n\`\`\``,
		});
	}
	return fields;
}

/**
 * @param {import("client")} client
 * @param {string} guildId
 * @returns {import("discord.js").TextChannel?}
*/
async function getLogChannel(client, guildId) {
	const { logChannel: channelId } = await client.prisma.guild.findUnique({
		select: { logChannel: true },
		where: { id: guildId },
	});
	return channelId && client.channels.cache.get(channelId);
}

/**
 * @param {import("client")} client
 * @param {*} target
 * @returns {string} target.type
 * @returns {string} target.id
*/
async function getTargetName(client, target) {
	if (target.type === 'settings') {
		return client.guilds.cache.get(target.id).name;
	} else {
		const row = await client.prisma[target.type].findUnique({ where: { id: target.id } });
		return row.name ?? target.id;
	}
}

/**
 * @param {import("client")} client
 * @param {object} details
 * @param {string} details.guildId
 * @param {string} details.userId
 * @param {string} details.action
*/
async function logAdminEvent(client, {
	guildId, userId, action, target, diff,
}) {
	const user = await client.users.fetch(userId);
	client.log.info(`${user.tag} ${action}d ${target.type} ${target.id}`);
	const settings = await client.prisma.guild.findUnique({
		select: {
			footer: true,
			locale: true,
			logChannel: true,
		},
		where: { id: guildId },
	});
	if (!settings.logChannel) return;
	const getMessage = client.i18n.getLocale(settings.locale);
	const i18nOptions = {
		user: `<@${user.id}>`,
		verb: getMessage(`log.admin.verb.${action}`),
	};
	const channel = client.channels.cache.get(settings.logChannel);
	if (!channel) return;
	const targetName = await getTargetName(client, target);

	return await channel.send({
		embeds: [
			new MessageEmbed()
				.setColor('ORANGE')
				.setAuthor({
					iconURL: user.avatarURL(),
					name: user.username,
				})
				.setTitle(getMessage('log.admin.title.joined', {
					...i18nOptions,
					targetType: getMessage(`log.admin.title.target.${target.type}`),
					verb: getMessage(`log.admin.verb.${action}`),
				}))
				.setDescription(getMessage('log.admin.description.joined', {
					...i18nOptions,
					targetType: getMessage(`log.admin.description.target.${target.type}`),
					verb: getMessage(`log.admin.verb.${action}`),
				}))
				.addField(getMessage(`log.admin.title.target.${target.type}`), targetName),
			// .setFooter({
			// 	iconURL: client.guilds.cache.get(guildId).iconURL(),
			// 	text: settings.footer,
			// }),
			...[
				diff &&
				new MessageEmbed()
					.setColor('ORANGE')
					.setTitle(getMessage('log.admin.differences'))
					.setFields(makeDiff(diff)),
			],
		],
	});
}

module.exports = {
	getLogChannel,
	logAdminEvent,
};