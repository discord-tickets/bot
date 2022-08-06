const {
	ActionRowBuilder,
	ModalBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const emoji = require('node-emoji');
const ms = require('ms');
const { EmbedBuilder } = require('discord.js');

module.exports = class TicketManager {
	constructor(client) {
		/** @type {import("client")} */
		this.client = client;
	}

	/**
	 * @param {object} data
	 * @param {string} data.category
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction} data.interaction
	 * @param {string?} [data.topic]
	 */
	async create({
		categoryId, interaction, topic, reference,
	}) {
		const cacheKey = `cache/category+guild+questions:${categoryId}`;
		/** @type {import('@prisma/client').Category} */
		let category = await this.client.keyv.get(cacheKey);
		if (!category) {
			category = await this.client.prisma.category.findUnique({
				include: {
					guild: true,
					questions: true,
				},
				where: { id: Number(categoryId) },
			});
			if (!category) {
				let settings;
				if (interaction.guild) {
					settings = await this.client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
				} else {
					settings = {
						errorColour: 'Red',
						locale: 'en-GB',
					};
				}
				const getMessage = this.client.i18n.getLocale(settings.locale);
				const embed = new EmbedBuilder()
					.setColor(settings.errorColour)
					.setTitle(getMessage('misc.unknown_category.title'))
					.setDescription(getMessage('misc.unknown_category.description'));
				if (settings.footer) {
					embed.setFooter({
						iconURL: interaction.guild?.iconURL(),
						text: settings.footer,
					});
				}
				return await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			this.client.keyv.set(cacheKey, category, ms('5m'));
		}

		const getMessage = this.client.i18n.getLocale(category.guild.locale);

		const rlKey = `ratelimits/guild-user:${category.guildId}-${interaction.user.id}`;
		const rl = await this.client.keyv.get(rlKey);
		if (rl) {
			const embed = new EmbedBuilder()
				.setColor(category.guild.errorColour)
				.setTitle(getMessage('misc.ratelimited.title'))
				.setDescription(getMessage('misc.ratelimited.description'));
			if (category.guild.footer) {
				embed.setFooter({
					iconURL: interaction.guild.iconURL(),
					text: category.guild.footer,
				});
			}
			return await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		} else {
			this.client.keyv.set(rlKey, true, ms('10s'));
		}

		// TODO: if member !required roles -> stop

		// TODO: if discordCategory has 50 channels -> stop

		// TODO: if category has max channels -> stop

		// TODO: if member has max -> stop

		// TODO: if cooldown -> stop

		if (category.questions.length >= 1) {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(JSON.stringify({
						action: 'questions',
						categoryId,
						reference,
					}))
					.setTitle(category.name)
					.setComponents(
						category.questions
							.filter(q => q.type === 'TEXT') // TODO: remove this when modals support select menus
							.sort((a, b) => a.order - b.order)
							.map(q => {
								if (q.type === 'TEXT') {
									return new ActionRowBuilder()
										.setComponents(
											new TextInputBuilder()
												.setCustomId(q.id)
												.setLabel(q.label)
												.setStyle(q.style)
												.setMaxLength(q.maxLength)
												.setMinLength(q.minLength)
												.setPlaceholder(q.placeholder)
												.setRequired(q.required)
												.setValue(q.value),
										);
								} else if (q.type === 'MENU') {
									return new ActionRowBuilder()
										.setComponents(
											new SelectMenuBuilder()
												.setCustomId(q.id)
												.setPlaceholder(q.placeholder || q.label)
												.setMaxValues(q.maxLength)
												.setMinValues(q.minLength)
												.setOptions(
													q.options.map((o, i) => {
														const builder = new SelectMenuOptionBuilder()
															.setValue(String(i))
															.setLabel(o.label);
														if (o.description) builder.setDescription(o.description);
														if (o.emoji) builder.setEmoji(emoji.hasEmoji(o.emoji) ? emoji.get(o.emoji) : { id: o.emoji });
														return builder;
													}),
												),
										);
								}
							}),
					),
			);
		} else if (category.requireTopic && !topic) {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(JSON.stringify({
						action: 'topic',
						categoryId,
						reference,
					}))
					.setTitle(category.name)
					.setComponents(
						new ActionRowBuilder()
							.setComponents(
								new TextInputBuilder()
									.setCustomId('topic')
									.setLabel(getMessage('modals.topic'))
									.setStyle(TextInputStyle.Long),
							),
					),
			);
		} else {
			await this.postQuestions({
				categoryId,
				interaction,
				topic,
			});
		}
	}

	/**
	 * @param {object} data
	 * @param {string} data.category
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction|import("discord.js").ModalSubmitInteraction} data.interaction
	 * @param {string?} [data.topic]
	 */
	async postQuestions({
		categoryId, interaction, topic, reference,
	}) {
		await interaction.deferReply({ ephemeral: true });
		console.log(require('util').inspect(interaction, {
			colors: true,
			depth: 10,
		}));
		if (interaction.isModalSubmit()) {

		}

		interaction.editReply({
			components: [],
			embeds: [],
		});
	}
};