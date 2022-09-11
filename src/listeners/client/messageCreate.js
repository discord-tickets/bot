const { Listener } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle: { Success },
	ChannelType,
	ComponentType,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
} = require('discord.js');
const { getCommonGuilds } = require('../../lib/users');
const ms = require('ms');
const emoji = require('node-emoji');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'messageCreate',
		});
	}

	/**
 	 * @param {import('@prisma/client').Guild} settings
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction} interaction
	 */
	async useGuild(settings, interaction, topic) {
		const getMessage = this.client.i18n.getLocale(settings.locale);
		if (settings.categories.length === 0) {
			interaction.update({
				components: [],
				embeds: [
					new EmbedBuilder()
						.setColor(settings.errorColour)
						.setTitle(getMessage('misc.no_categories.title'))
						.setDescription(getMessage('misc.no_categories.description')),
				],
			});
		} else if (settings.categories.length === 1) {
			await this.client.tickets.create({
				categoryId: settings.categories[0].id,
				interaction,
				topic,
			});
		} else {
			await interaction.update({
				components: [
					new ActionRowBuilder()
						.setComponents(
							new SelectMenuBuilder()
								.setCustomId(JSON.stringify({
									action: 'create',
									topic,
								}))
								.setPlaceholder(getMessage('menus.category.placeholder'))
								.setOptions(
									settings.categories.map(category =>
										new SelectMenuOptionBuilder()
											.setValue(String(category.id))
											.setLabel(category.name)
											.setDescription(category.description)
											.setEmoji(emoji.hasEmoji(category.emoji) ? emoji.get(category.emoji) : { id: category.emoji }),
									),
								),
						),
				],
			});
			interaction.message.awaitMessageComponent({
				componentType: ComponentType.SelectMenu,
				filter: () => true,
				time: ms('30s'),
			})
				.then(async () => {
					interaction.message.delete();
				})
				.catch(error => {
					if (error) this.client.log.error(error);
					interaction.message.delete();
				});
		}

	}

	/**
	 * @param {import("discord.js").Message} message
	 */
	async run(message) {
		/** @type {import("client")} */
		const client = this.client;

		if (message.channel.type === ChannelType.DM) {
			if (message.author.bot) return false;
			const commonGuilds = await getCommonGuilds(client, message.author.id);
			if (commonGuilds.size === 0) {
				return false;
			} else if (commonGuilds.size === 1) {
				const settings = await client.prisma.guild.findUnique({
					select: {
						categories: true,
						errorColour: true,
						locale: true,
						primaryColour: true,
					},
					where: { id: commonGuilds.at(0).id },
				});
				const getMessage = client.i18n.getLocale(settings.locale);
				const sent = await message.reply({
					components: [
						new ActionRowBuilder()
							.setComponents(
								new ButtonBuilder()
									.setCustomId(message.id)
									.setStyle(Success)
									.setLabel(getMessage('buttons.confirm_open.text'))
									.setEmoji(getMessage('buttons.confirm_open.emoji')),
							),
					],
					embeds: [
						new EmbedBuilder()
							.setColor(settings.primaryColour)
							.setTitle(getMessage('dm.confirm_open.title'))
							.setDescription(message.content),
					],
				});
				sent.awaitMessageComponent({
					componentType: ComponentType.Button,
					filter: () => true,
					time: ms('30s'),
				})
					.then(async interaction => await this.useGuild(settings, interaction, message.content))
					.catch(error => {
						if (error) client.log.error(error);
						sent.delete();
					});
			} else {
				const getMessage = client.i18n.getLocale();
				const sent = await message.reply({
					components: [
						new ActionRowBuilder()
							.setComponents(
								new SelectMenuBuilder()
									.setCustomId(message.id)
									.setPlaceholder(getMessage('menus.guild.placeholder'))
									.setOptions(
										commonGuilds.map(g =>
											new SelectMenuOptionBuilder()
												.setValue(String(g.id))
												.setLabel(g.name),
										),
									),
							),

					],
				});
				sent.awaitMessageComponent({
					componentType: ComponentType.SelectMenu,
					filter: () => true,
					time: ms('30s'),
				})
					.then(async interaction => {
						const settings = await client.prisma.guild.findUnique({
							select: {
								categories: true,
								errorColour: true,
								locale: true,
								primaryColour: true,
							},
							where: { id: interaction.values[0] },
						});
						await this.useGuild(settings, interaction, message.content);
					})
					.catch(error => {
						if (error) client.log.error(error);
						sent.delete();
					});
			}
		} else {
			// TODO: archive messages in tickets
			// TODO: first response
			// TODO: lastMessageAt
			// TODO: auto tag
			// TODO: staff status alert, working hours alerts
		}
	}
};