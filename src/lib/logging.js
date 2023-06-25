const {
	cleanCodeBlockContent,
	EmbedBuilder,
} = require('discord.js');
const { diff: getDiff } = require('object-diffy');
const ShortUniqueId = require('short-unique-id');

const uid = new ShortUniqueId();

const getSUID = () => uid.stamp(10);

const uuidRegex = /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g;

const exists = thing => typeof thing === 'string' ? thing.length > 0 : thing !== null && thing !== undefined;

const arrToObj = obj => {
	for (const key in obj) {
		if (obj[key] instanceof Array && obj[key][0]?.id) {
			const temp = {};
			obj[key].forEach(v => (temp[v.id] = v));
			obj[key] = temp;
		}
	}
	return obj;
};

function makeDiff({
	original, updated,
}) {
	const diff = getDiff(arrToObj(original), arrToObj(updated));
	const fields = [];
	for (const key in diff) {
		if (key === 'createdAt') continue; // object-diffy doesn't like dates
		const from = exists(diff[key].from) ? `- ${String(diff[key].from).replace(/\n/g, '\\n')}\n` : '';
		const to = exists(diff[key].to) ? `+ ${String(diff[key].to).replace(/\n/g, '\\n')}\n` : '';
		fields.push({
			inline: true,
			name: key.replace(uuidRegex, $1 => $1.split('-')[0]),
			value: `\`\`\`diff\n${cleanCodeBlockContent(from + to)}\n\`\`\``,
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
	const settings = await client.prisma.guild.findUnique({
		select: {
			footer: true,
			locale: true,
			logChannel: true,
		},
		where: { id: guildId },
	});
	/** @type {import("discord.js").Guild} */
	const guild = client.guilds.cache.get(guildId);
	const member = await guild.members.fetch(userId);
	client.log.info.settings(`${member.user.tag} ${action}d ${target.type} ${target.id}`);
	if (!settings.logChannel) return;
	const colour = action === 'create'
		? 'Green' : action === 'update'
			? 'Orange' : action === 'delete'
				? 'Red' : 'Default';
	const getMessage = client.i18n.getLocale(settings.locale);
	const i18nOptions = {
		user: `<@${member.user.id}>`,
		verb: getMessage(`log.admin.verb.${action}`),
	};
	const channel = client.channels.cache.get(settings.logChannel);
	if (!channel) return;
	const embeds = [
		new EmbedBuilder()
			.setColor(colour)
			.setAuthor({
				iconURL: member.displayAvatarURL(),
				name: member.displayName,
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
			.addFields([
				{
					name: getMessage(`log.admin.title.target.${target.type}`),
					value: target.name ? `${target.name} (\`${target.id}\`)` : target.id,
				},
			]),
	];

	if (diff?.original && Object.entries(makeDiff(diff)).length) {
		embeds.push(
			new EmbedBuilder()
				.setColor(colour)
				.setTitle(getMessage('log.admin.changes'))
				.setFields(makeDiff(diff)),
		);
	}

	return await channel.send({ embeds });
}

/**
 * @param {import("client")} client
 * @param {object} details
 * @param {string} details.guildId
 * @param {string} details.userId
 * @param {string} details.action
*/
async function logTicketEvent(client, {
	userId, action, target, diff,
}) {
	const ticket = await client.tickets.getTicket(target.id);
	if (!ticket) return;
	/** @type {import("discord.js").Guild} */
	const guild = client.guilds.cache.get(ticket.guild.id);
	const member = await guild.members.fetch(userId);
	client.log.info.tickets(`${member.user.tag} ${client.i18n.getMessage('en-GB', `log.ticket.verb.${action}`)} ticket ${target.id}`);
	if (!ticket.guild.logChannel) return;
	const channel = client.channels.cache.get(ticket.guild.logChannel);
	if (!channel) return;
	const colour = action === 'create'
		? 'Aqua' : action === 'close'
			? 'DarkAqua' : action === 'update'
				? 'Purple' : action === 'claim'
					? 'LuminousVividPink' : action === 'unclaim'
						? 'DarkVividPink' : 'Default';
	const getMessage = client.i18n.getLocale(ticket.guild.locale);
	const i18nOptions = {
		user: `<@${member.user.id}>`,
		verb: getMessage(`log.ticket.verb.${action}`),
	};
	const embeds = [
		new EmbedBuilder()
			.setColor(colour)
			.setAuthor({
				iconURL: member.displayAvatarURL(),
				name: member.displayName,
			})
			.setTitle(getMessage('log.ticket.title', i18nOptions))
			.setDescription(getMessage('log.ticket.description', i18nOptions))
			.addFields([
				{
					name: getMessage('log.ticket.ticket'),
					value: target.name ? `${target.name} (\`${target.id}\`)` : target.id,
				},
			]),
	];

	if (diff?.original && Object.entries(makeDiff(diff)).length) {
		embeds.push(
			new EmbedBuilder()
				.setColor(colour)
				.setTitle(getMessage('log.admin.changes'))
				.setFields(makeDiff(diff)),
		);
	}

	return await channel.send({ embeds });
}

/**
 * @param {import("client")} client
 * @param {object} details
 * @param {string} details.action
 * @param {import("discord.js").Message} details.target
 * @param {import("@prisma/client").Ticket & {guild: import("@prisma/client").Guild}} details.ticket
*/
async function logMessageEvent(client, {
	action, executor, target, ticket, diff,
}) {
	if (!ticket) return;
	if (executor === undefined) executor = target.member;
	client.log.info.tickets(`${executor?.user.tag || 'Unknown'} ${client.i18n.getMessage('en-GB', `log.message.verb.${action}`)} message ${target.id}`);
	if (!ticket.guild.logChannel) return;
	const colour = action === 'update'
		? 'Purple' : action === 'delete'
			? 'DarkPurple' : 'Default';
	const getMessage = client.i18n.getLocale(ticket.guild.locale);
	const i18nOptions = {
		user: `<@${executor?.user.id}>`,
		verb: getMessage(`log.message.verb.${action}`),
	};
	const channel = client.channels.cache.get(ticket.guild.logChannel);
	if (!channel) return;
	const embeds = [
		new EmbedBuilder()
			.setColor(colour)
			.setAuthor({
				iconURL: target.member?.displayAvatarURL() || 'https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png',
				name: target.member?.displayName || 'Unknown',
			})
			.setTitle(getMessage('log.message.title', i18nOptions))
			.setDescription(getMessage('log.message.description', i18nOptions))
			.addFields([
				{
					name: getMessage('log.message.message'),
					value: `[\`${target.id}\`](${target.url})`,
				},
			]),
	];

	if (diff?.original && Object.entries(makeDiff(diff)).length) {
		embeds.push(
			new EmbedBuilder()
				.setColor(colour)
				.setTitle(getMessage('log.admin.changes'))
				.setFields(makeDiff(diff)),
		);
	}

	return await channel.send({ embeds });
}

module.exports = {
	getLogChannel,
	getSUID,
	logAdminEvent,
	logMessageEvent,
	logTicketEvent,
};
