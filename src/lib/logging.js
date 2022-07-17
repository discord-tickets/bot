const { MessageEmbed } = require('discord.js');
const { diff: getDiff } = require('object-diffy');

function makeDiff({
	original, updated,
}) {
	const diff = getDiff(original, updated);
	const fields = [];
	for (const key in diff) {
		if (key === 'createdAt') continue; // object-diffy doesn't like dates
		const from = diff[key].from === null ? '' : `- ${diff[key].from}\n`;
		const to = diff[key].to === null ? '' : `+ ${diff[key].to}\n`;
		fields.push({
			inline: true,
			name: key,
			value: `\`\`\`diff\n${from + to}\n\`\`\``,
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
 * @param {object} details
 * @param {string} details.guildId
 * @param {string} details.userId
 * @param {string} details.action
*/
async function logAdminEvent(client, {
	guildId, userId, action, target, diff,
}) {
	const user = await client.users.fetch(userId);
	client.log.info.settings(`${user.tag} ${action}d ${target.type} ${target.id}`);
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
				.addField(getMessage(`log.admin.title.target.${target.type}`), target.name ?? target.id),
			// .setFooter({
			// 	iconURL: client.guilds.cache.get(guildId).iconURL(),
			// 	text: settings.footer,
			// }),
			...[
				diff?.original &&
				new MessageEmbed()
					.setColor('ORANGE')
					.setTitle(getMessage('log.admin.changes.title'))
					.setDescription(getMessage('log.admin.changes.description'))
					.setFields(makeDiff(diff)),
			],
		],
	});
}

module.exports = {
	getLogChannel,
	logAdminEvent,
};