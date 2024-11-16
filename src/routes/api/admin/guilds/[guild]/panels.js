const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle: {
		Primary,
		Secondary,
	},
	ChannelType: { GuildText },
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} = require('discord.js');
const emoji = require('node-emoji');
const { logAdminEvent } = require('../../../../../lib/logging');

module.exports.post = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
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

		/** @type {import("discord.js").TextChannel} */
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
			.setTitle(data.title);

		if (settings.footer) {
			embed.setFooter({
				iconURL: guild.iconURL(),
				text: settings.footer,
			});
		}

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
							action: 'create',
							target: categories[0].id,
						}))
						.setStyle(Primary)
						.setLabel(getMessage('buttons.create.text'))
						.setEmoji(getMessage('buttons.create.emoji')),
				);
			} else if (data.type === 'BUTTON') {
				components.push(
					...categories.map(category =>
						new ButtonBuilder()
							.setCustomId(JSON.stringify({
								action: 'create',
								target: category.id,
							}))
							.setStyle(Secondary)
							.setLabel(category.name)
							.setEmoji(emoji.hasEmoji(category.emoji) ? emoji.get(category.emoji) : { id: category.emoji }),
					),
				);
			} else {
				components.push(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify({ action: 'create' }))
						.setPlaceholder(getMessage('menus.category.placeholder'))
						.setOptions(
							categories.map(category =>
								new StringSelectMenuOptionBuilder()
									.setValue(String(category.id))
									.setLabel(category.name)
									.setDescription(category.description)
									.setEmoji(emoji.hasEmoji(category.emoji) ? emoji.get(category.emoji) : { id: category.emoji }),
							),
						),
				);

			}

			try {
				await channel.send({
					components: [
						new ActionRowBuilder()
							.setComponents(components),
					],
					embeds: [embed],
				});
			} catch (error) {
				if (!data.channel) await channel.delete('Failed to send panel');

				const human_errors = [];
				const action_row = error?.rawError?.errors?.components?.['0'];

				if (action_row) {
					const buttons_or_options = {
						BUTTON: action_row.components,
						MENU: action_row.components['0'].options,
					}[data.type];

					for (const [k, v] of Object.entries(buttons_or_options)) {
						// const category = categories.find(category => category.id === parseInt(k));
						const category = categories[parseInt(k)]; // k is a string of the index, not ID
						// eslint-disable-next-line no-underscore-dangle
						const emoji_errors = v.emoji?.id?._errors;
						if (emoji_errors) {
							const invalid_name = emoji_errors[0]?.message?.match(/Value "(.*)" is not snowflake/)?.[1];
							if (invalid_name) {
								const url = `${process.env.HTTP_EXTERNAL}/settings/${guild.id}/categories/${category.id}`;
								human_errors.push({
									message: `The emoji for the \`${category.name}\` category is invalid: \`${invalid_name}\`. <a href="${url}" target="_blank">Click here</a> to open the category's settings page in a new tab.`,
									type: 'invalid_emoji',
								});
							}
						}
					}
				}

				if (human_errors.length) {
					return res.code(400).send({
						code: error.code,
						errors: human_errors,
						status: error.status,
					});
				}

				throw error;
			}
		}

		logAdminEvent(client, {
			action: 'create',
			guildId: guild.id,
			target: {
				id: channel.toString(),
				type: 'panel',
			},
			userId: req.user.id,
		});

		return true;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
