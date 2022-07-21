const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle: {
		Primary,
		Secondary,
	},
	ChannelType: { GuildText },
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
} = require('discord.js');
const emoji = require('node-emoji');
const { logAdminEvent } = require('../../../../../lib/logging');

module.exports.post = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const guild = client.guilds.cache.get(req.params.guild);
		const data = req.body;

		const settings = await client.prisma.guild.findUnique({
			select: {
				categories: true,
				footer: true,
				locale: true,
				primaryColour: true,
			},
			where: { id: guild.id },
		});
		const getMessage = client.i18n.getLocale(settings.locale);
		const categories = settings.categories.filter(c => data.categories.includes(c.id));
		if (categories.length === 0) throw new Error('No categories');
		if (categories.length !== 1 && data.type === 'MESSAGE') throw new Error('Invalid number of categories for panel type');

		let channel;
		if (data.channel) {
			channel = await client.channels.fetch(data.channel);
		} else {
			const allow = ['ViewChannel', 'ReadMessageHistory'];
			if (data.type === 'MESSAGE') allow.push('SendMessages');
			channel = await guild.channels.create({
				name: 'create-a-ticket',
				permissionOverwrites: [
					{
						allow,
						deny: ['AddReactions', 'AttachFiles'],
						id: guild.roles.everyone,
					},
				],
				position: 1,
				rateLimitPerUser: 15,
				reason: 'New ticket panel',
				type: GuildText,
			});
		}

		const embed = new EmbedBuilder()
			.setColor(settings.primaryColour)
			.setTitle(data.title)
			.setFooter({
				iconURL: guild.iconURL(),
				text: settings.footer,
			});

		if (data.description) embed.setDescription(data.description);
		if (data.image) embed.setImage(data.image);
		if (data.thumbnail) embed.setThumbnail(data.thumbnail);

		if (data.type === 'MESSAGE') {
			await channel.send({ embeds: [embed] });
		} else {
			const components = [];

			if (categories.length === 1) {
				components.push(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({
							action: 'createTicket',
							target: categories[0].id,
						}))
						.setStyle(Primary)
						.setLabel(getMessage('buttons.create.text'))
						.setEmoji(getMessage('buttons.create.emoji')),
				);
			} else {
				if (data.type === 'BUTTON') {
					components.push(
						...categories.map(category =>
							new ButtonBuilder()
								.setCustomId(JSON.stringify({
									action: 'createTicket',
									target: category.id,
								}))
								.setStyle(Secondary)
								.setLabel(category.name)
								.setEmoji(emoji.hasEmoji(category.emoji) ? emoji.get(category.emoji) : { id: category.emoji }),
						),
					);
				} else {
					components.push(
						new SelectMenuBuilder()
							.setCustomId('createTicket')
							.setPlaceholder(getMessage('menus.panel.placeholder'))
							.setOptions(
								categories.map(category =>
									new SelectMenuOptionBuilder()
										.setValue(String(category.id))
										.setLabel(category.name)
										.setDescription(category.description)
										.setEmoji(emoji.hasEmoji(category.emoji) ? emoji.get(category.emoji) : { id: category.emoji }),
								),
							),
					);
				}
			}

			await channel.send({
				components: [
					new ActionRowBuilder()
						.setComponents(components),
				],
				embeds: [embed],
			});
		}

		logAdminEvent(client, {
			action: 'create',
			guildId: guild.id,
			target: {
				id: channel.toString(),
				type: 'panel',
			},
			userId: req.user.payload.id,
		});

		return true;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});