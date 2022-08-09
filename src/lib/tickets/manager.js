/* eslint-disable max-lines */
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const emoji = require('node-emoji');
const ms = require('ms');
const ExtendedEmbedBuilder = require('../embed');
const { logTicketEvent } = require('../logging');

/**
 * @typedef {import('@prisma/client').Category & {guild: import('@prisma/client').Guild} & {questions: import('@prisma/client').Question[]}} CategoryGuildQuestions
 */
module.exports = class TicketManager {
	constructor(client) {
		/** @type {import("client")} */
		this.client = client;
	}

	/**
	 * @param {object} data
	 * @param {string} data.categoryId
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction} data.interaction
	 * @param {string?} [data.topic]
	 */
	async create({
		categoryId, interaction, topic, referencesMessage, referencesTicket,
	}) {
		categoryId = Number(categoryId);
		const cacheKey = `cache/category+guild+questions:${categoryId}`;
		/** @type {CategoryGuildQuestions} */
		let category = await this.client.keyv.get(cacheKey);
		if (!category) {
			category = await this.client.prisma.category.findUnique({
				include: {
					guild: true,
					questions: { orderBy: { order: 'asc' } },
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
				return await interaction.reply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild?.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.errorColour)
							.setTitle(getMessage('misc.unknown_category.title'))
							.setDescription(getMessage('misc.unknown_category.description')),
					],
					ephemeral: true,
				});
			}
			this.client.keyv.set(cacheKey, category, ms('5m'));
		}

		const getMessage = this.client.i18n.getLocale(category.guild.locale);

		const rlKey = `ratelimits/guild-user:${category.guildId}-${interaction.user.id}`;
		const rl = await this.client.keyv.get(rlKey);
		if (rl) {
			return await interaction.reply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: category.guild.footer,
					})
						.setColor(category.guild.errorColour)
						.setTitle(getMessage('misc.ratelimited.title'))
						.setDescription(getMessage('misc.ratelimited.description')),
				],
				ephemeral: true,
			});
		} else {
			this.client.keyv.set(rlKey, true, ms('5s'));
		}

		const sendError = name => interaction.reply({
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: interaction.guild.iconURL(),
					text: category.guild.footer,
				})
					.setColor(category.guild.errorColour)
					.setTitle(getMessage(`misc.${name}.title`))
					.setDescription(getMessage(`misc.${name}.description`)),
			],
			ephemeral: true,
		});

		/** @type {import("discord.js").Guild} */
		const guild = this.client.guilds.cache.get(category.guild.id);
		const member = interaction.member ?? await guild.members.fetch(interaction.user.id);

		if (category.guild.blocklist.length !== 0) {
			const blocked = category.guild.blocklist.some(r => member.roles.cache.has(r));
			if (blocked) return await sendError('blocked');
		}

		if (category.requiredRoles.length !== 0) {
			const missing = category.requiredRoles.some(r => !member.roles.cache.has(r));
			if (missing) return await sendError('missing_roles');
		}

		const discordCategory = guild.channels.cache.get(category.discordCategory);
		if (discordCategory.children.cache.size === 50) return await sendError('category_full');

		// TODO: store locally and sync regularly so this isn't done during an interaction?
		const totalCount = await this.client.prisma.ticket.count({
			where: {
				categoryId: category.id,
				open: true,
			},
		});
		if (totalCount >= category.totalLimit) return await sendError('category_full');

		const memberCount = await this.client.prisma.ticket.count({
			where: {
				categoryId: category.id,
				createdById: interaction.user.id,
				open: true,
			},
		});

		if (memberCount >= category.memberLimit) {
			return await interaction.reply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: category.guild.footer,
					})
						.setColor(category.guild.errorColour)
						.setTitle(getMessage('misc.member_limit.title', memberCount, memberCount))
						.setDescription(getMessage('misc.member_limit.description', memberCount)),
				],
				ephemeral: true,
			});
		}

		const lastTicket = await this.client.prisma.ticket.findFirst({
			orderBy: [{ closedAt: 'desc' }],
			select: { closedAt: true },
			where: {
				categoryId: category.id,
				createdById: interaction.user.id,
				open: false,
			},
		});

		if (Date.now() - lastTicket.closedAt < category.cooldown) {
			return await interaction.reply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: category.guild.footer,
					})
						.setColor(category.guild.errorColour)
						.setTitle(getMessage('misc.cooldown.title'))
						.setDescription(getMessage('misc.cooldown.description', { time: ms(category.cooldown - (Date.now() - lastTicket.closedAt)) })),
				],
				ephemeral: true,
			});
		}

		if (category.questions.length >= 1) {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(JSON.stringify({
						action: 'questions',
						categoryId,
						referencesMessage,
						referencesTicket,
					}))
					.setTitle(category.name)
					.setComponents(
						category.questions
							.filter(q => q.type === 'TEXT') // TODO: remove this when modals support select menus
							.map(q => {
								if (q.type === 'TEXT') {
									return new ActionRowBuilder()
										.setComponents(
											new TextInputBuilder()
												.setCustomId(q.id)
												.setLabel(q.label)
												.setStyle(q.style)
												.setMaxLength(Math.min(q.maxLength, 1000))
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
						referencesMessage,
						referencesTicket,
					}))
					.setTitle(category.name)
					.setComponents(
						new ActionRowBuilder()
							.setComponents(
								new TextInputBuilder()
									.setCustomId('topic')
									.setLabel(getMessage('modals.topic.label'))
									.setStyle(TextInputStyle.Paragraph)
									.setMaxLength(1000)
									.setMinLength(5)
									.setPlaceholder(getMessage('modals.topic.placeholder'))
									.setRequired(true),
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
		action, categoryId, interaction, topic, referencesMessage, referencesTicket,
	}) {
		await interaction.deferReply({ ephemeral: true });

		const cacheKey = `cache/category+guild+questions:${categoryId}`;
		/** @type {CategoryGuildQuestions} */
		const category = await this.client.keyv.get(cacheKey);

		let answers;
		if (interaction.isModalSubmit()) {
			if (action === 'questions') {
				answers = category.questions.map(q => ({
					questionId: q.id,
					userId: interaction.user.id,
					value: interaction.fields.getTextInputValue(q.id),
				}));
				if (category.customTopic) topic = interaction.fields.getTextInputValue(category.customTopic);
			} else if (action === 'topic') {
				topic = interaction.fields.getTextInputValue('topic');
			}
		}

		/** @type {import("discord.js").Guild} */
		const guild = this.client.guilds.cache.get(category.guild.id);
		const getMessage = this.client.i18n.getLocale(category.guild.locale);
		const creator = await guild.members.fetch(interaction.user.id);
		const number = (await this.client.prisma.ticket.count({ where: { guildId: category.guild.id } })) + 1;
		const channelName = category.channelName
			.replace(/{+\s?(user)?name\s?}+/gi, creator.user.username)
			.replace(/{+\s?(nick|display)(name)?\s?}+/gi, creator.displayName)
			.replace(/{+\s?num(ber)?\s?}+/gi, number === 1488 ? '1487b' : number);
		const allow = ['ViewChannel', 'ReadMessageHistory', 'SendMessages', 'EmbedLinks', 'AttachFiles'];
		/** @type {import("discord.js").TextChannel} */
		const channel = await guild.channels.create({
			name: channelName,
			parent: category.discordCategory,
			permissionOverwrites: [
				{
					deny: ['ViewChannel'],
					id: guild.roles.everyone,
				},
				{
					allow: allow,
					id: this.client.user.id,
				},
				{
					allow: allow,
					id: creator.id,
				},
				...category.staffRoles.map(id => ({
					allow: allow,
					id,
				})),
			],
			rateLimitPerUser: category.ratelimit,
			reason: `${creator.user.tag} created a ticket`,
			topic: `${creator}${topic?.length > 0 ? ` | ${topic}` : ''}`,
		});

		if (category.image) await channel.send(category.image);

		const embeds = [
			new ExtendedEmbedBuilder()
				.setColor(category.guild.primaryColour)
				.setAuthor({
					iconURL: creator.displayAvatarURL(),
					name: creator.displayName,
				})
				.setDescription(
					category.openingMessage
						.replace(/{+\s?(user)?name\s?}+/gi, creator.user.toString()),

				),
		];

		if (answers) {
			embeds.push(
				new ExtendedEmbedBuilder()
					.setColor(category.guild.primaryColour)
					.setFields(
						category.questions
							.map(q => ({
								name: q.label,
								value: interaction.fields.getTextInputValue(q.id) || getMessage('ticket.answers.no_value'),
							})),
					),
			);
			// embeds[0].setFields(
			// 	category.questions.map(q => ({
			// 		name: q.label,
			// 		value: interaction.fields.getTextInputValue(q.id) || getMessage('ticket.answers.no_value'),
			// 	})),
			// );
		} else if (topic) {
			embeds.push(
				new ExtendedEmbedBuilder()
					.setColor(category.guild.primaryColour)
					.setFields({
						name: getMessage('ticket.opening_message.fields.topic'),
						value: topic,
					}),
			);
			// embeds[0].setFields({
			// 	name: getMessage('ticket.opening_message.fields.topic'),
			// 	value: topic,
			// });
		}

		if (category.guild.footer) {
			embeds[embeds.length - 1].setFooter({
				iconURL: guild.iconURL(),
				text: category.guild.footer,
			});
		}

		const components = new ActionRowBuilder();

		if (topic || answers) {
			components.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify({ action: 'edit' }))
					.setStyle(ButtonStyle.Secondary)
					.setEmoji(getMessage('buttons.edit.emoji'))
					.setLabel(getMessage('buttons.edit.text')),
			);
		}

		if (category.guild.claimButton && category.claiming) {
			components.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify({ action: 'claim' }))
					.setStyle(ButtonStyle.Secondary)
					.setEmoji(getMessage('buttons.claim.emoji'))
					.setLabel(getMessage('buttons.claim.text')),
			);
		}

		if (category.guild.closeButton) {
			components.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify({ action: 'close' }))
					.setStyle(ButtonStyle.Danger)
					.setEmoji(getMessage('buttons.close.emoji'))
					.setLabel(getMessage('buttons.close.text')),
			);
		}

		const pings = category.pingRoles.map(r => `<@&${r}>`).join(' ');
		const sent = await channel.send({
			components: components.components.length >= 1 ? [components] : [],
			content: getMessage('ticket.opening_message.content', {
				creator: interaction.user.toString(),
				staff: pings ? pings + ',' : '',
			}),
			embeds,
		});
		await sent.pin({ reason: 'Ticket opening message' });
		const pinned = channel.messages.cache.last();

		if (pinned.system) {
			pinned
				.delete({ reason: 'Cleaning up system message' })
				.catch(() => this.client.log.warn('Failed to delete system pin message'));
		}

		// TODO: referenced msg or ticket

		const data = {
			category: { connect: { id: categoryId } },
			createdBy: {
				connectOrCreate: {
					create: { id: interaction.user.id },
					where: { id: interaction.user.id },
				},
			},
			guild: { connect: { id: category.guild.id } },
			id: channel.id,
			number,
			openingMessageId: sent.id,
			topic,
		};
		if (referencesTicket) data.referencesTicket = { connect: { id: referencesTicket } };
		let message;
		if (referencesMessage) message = this.client.prisma.archivedMessage.findUnique({ where: { id: referencesMessage } });
		if (message) data.referencesMessage = { connect: { id: referencesMessage } }; // only add if the message has been archived ^^
		if (answers) data.questionAnswers = { createMany: { data: answers } };
		interaction.editReply({
			components: [],
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: guild.iconURL(),
					text: category.guild.footer,
				})
					.setColor(category.guild.successColour)
					.setTitle(getMessage('ticket.created.title'))
					.setDescription(getMessage('ticket.created.description', { channel: channel.toString() })),
			],
		});
		const ticket = await this.client.prisma.ticket.create({ data });
		logTicketEvent(this.client, {
			action: 'create',
			target: {
				id: ticket.id,
				name: channel.toString(),
			},
			userId: interaction.user.id,
		});
	}
};