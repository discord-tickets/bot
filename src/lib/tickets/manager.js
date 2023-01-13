/* eslint-disable no-underscore-dangle */
/* eslint-disable max-lines */
const TicketArchiver = require('./archiver');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	ModalBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const emoji = require('node-emoji');
const ms = require('ms');
const ExtendedEmbedBuilder = require('../embed');
const { logTicketEvent } = require('../logging');
const { isStaff } = require('../users');
const { Collection } = require('discord.js');
const Cryptr = require('cryptr');
const { encrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

/**
 * @typedef {import('@prisma/client').Category &
 * 	{guild: import('@prisma/client').Guild} &
 * 	{questions: import('@prisma/client').Question[]}} CategoryGuildQuestions
 */
module.exports = class TicketManager {
	constructor(client) {
		/** @type {import("client")} */
		this.client = client;
		this.archiver = new TicketArchiver(client);
		this.$count = { categories: {} };
		this.$stale = new Collection();
	}

	/**
	 * Retrieve cached category data
	 * @param {string} categoryId the category ID
	 * @param {boolean} force bypass & update the cache?
	 * @returns {Promise<CategoryGuildQuestions>}
	 */
	async getCategory(categoryId, force) {
		const cacheKey = `cache/category+guild+questions:${categoryId}`;
		/** @type {CategoryGuildQuestions} */
		let category = await this.client.keyv.get(cacheKey);
		if (!category || force) {
			category = await this.client.prisma.category.findUnique({
				include: {
					guild: true,
					questions: { orderBy: { order: 'asc' } },
				},
				where: { id: categoryId },
			});
			await this.client.keyv.set(cacheKey, category, ms('12h'));
		}
		return category;
	}

	// TODO: update when a ticket is closed or moved
	async getTotalCount(categoryId) {
		const category = this.$count.categories[categoryId];
		if (!category) this.$count.categories[categoryId] = {};
		let count = this.$count.categories[categoryId].total;
		if (!count) {
			count = await this.client.prisma.ticket.count({
				where: {
					categoryId,
					open: true,
				},
			});
			this.$count.categories[categoryId].total = count;
		}
		return count;
	}

	// TODO: update when a ticket is closed or moved
	async getMemberCount(categoryId, memberId) {
		const category = this.$count.categories[categoryId];
		if (!category) this.$count.categories[categoryId] = {};
		let count = this.$count.categories[categoryId][memberId];
		if (!count) {
			count = await this.client.prisma.ticket.count({
				where: {
					categoryId: categoryId,
					createdById: memberId,
					open: true,
				},
			});
			this.$count.categories[categoryId][memberId] = count;
		}
		return count;
	}

	async getCooldown(categoryId, memberId) {
		const cacheKey = `cooldowns/category-member:${categoryId}-${memberId}`;
		return await this.client.keyv.get(cacheKey);
	}

	/**
	 * @param {object} data
	 * @param {string} data.categoryId
	 * @param {import("discord.js").ChatInputCommandInteraction|import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction} data.interaction
	 * @param {string?} [data.topic]
	 */
	async create({
		categoryId, interaction, topic, referencesMessage, referencesTicketId,
	}) {
		categoryId = Number(categoryId);
		const category = await this.getCategory(categoryId);

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

		/** @type {import("discord.js").Guild} */
		const guild = this.client.guilds.cache.get(category.guild.id);
		const member = interaction.member ?? await guild.members.fetch(interaction.user.id);
		const getMessage = this.client.i18n.getLocale(category.guild.locale);

		const rlKey = `ratelimits/guild-user:${category.guildId}-${interaction.user.id}`;
		const rl = await this.client.keyv.get(rlKey);
		if (rl) {
			return await interaction.reply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: guild.iconURL(),
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
					iconURL: guild.iconURL(),
					text: category.guild.footer,
				})
					.setColor(category.guild.errorColour)
					.setTitle(getMessage(`misc.${name}.title`))
					.setDescription(getMessage(`misc.${name}.description`)),
			],
			ephemeral: true,
		});

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

		const totalCount = await this.getTotalCount(category.id);
		if (totalCount >= category.totalLimit) return await sendError('category_full');

		const memberCount = await this.getMemberCount(category.id, interaction.user.id);
		if (memberCount >= category.memberLimit) {
			return await interaction.reply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: guild.iconURL(),
						text: category.guild.footer,
					})
						.setColor(category.guild.errorColour)
						.setTitle(getMessage('misc.member_limit.title', memberCount, memberCount))
						.setDescription(getMessage('misc.member_limit.description', memberCount)),
				],
				ephemeral: true,
			});
		}

		const cooldown = await this.getCooldown(category.id, interaction.user.id);
		if (cooldown) {
			return await interaction.reply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: guild.iconURL(),
						text: category.guild.footer,
					})
						.setColor(category.guild.errorColour)
						.setTitle(getMessage('misc.cooldown.title'))
						.setDescription(getMessage('misc.cooldown.description', { time: ms(cooldown - Date.now()) })),
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
						referencesTicketId,
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
											new StringSelectMenuBuilder()
												.setCustomId(q.id)
												.setPlaceholder(q.placeholder || q.label)
												.setMaxValues(q.maxLength)
												.setMinValues(q.minLength)
												.setOptions(
													q.options.map((o, i) => {
														const builder = new StringSelectMenuOptionBuilder()
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
						referencesTicketId,
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
				referencesMessage,
				referencesTicketId,
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
		action, categoryId, interaction, topic, referencesMessage, referencesTicketId,
	}) {
		await interaction.deferReply({ ephemeral: true });

		const category = await this.getCategory(categoryId);

		let answers;
		if (interaction.isModalSubmit()) {
			if (action === 'questions') {
				answers = category.questions.filter(q => q.type === 'TEXT').map(q => ({
					questionId: q.id,
					userId: interaction.user.id,
					value: interaction.fields.getTextInputValue(q.id) ? encrypt(interaction.fields.getTextInputValue(q.id)) : '',
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
					allow,
					id: this.client.user.id,
				},
				{
					allow,
					id: creator.id,
				},
				...category.staffRoles.map(id => ({
					allow,
					id,
				})),
			],
			rateLimitPerUser: category.ratelimit,
			reason: `${creator.user.tag} created a ticket`,
			topic: `${creator}${topic?.length > 0 ? ` | ${topic}` : ''}`,
		});

		if (category.image) await channel.send(category.image);

		const statsCacheKey = `cache/category-stats/${categoryId}`;
		let stats = await this.client.keyv.get(statsCacheKey);
		if (!stats) {
			const { tickets } = await this.client.prisma.category.findUnique({
				select: { tickets: { where: { open: false } } },
				where: { id: categoryId },
			});
			stats = {
				avgResolutionTime: ms(tickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) ?? 1 / tickets.length),
				avgResponseTime: ms(tickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) ?? 1 / tickets.length),
			};
			this.client.keyv.set(statsCacheKey, stats, ms('1h'));
		}

		const embeds = [
			new ExtendedEmbedBuilder()
				.setColor(category.guild.primaryColour)
				.setAuthor({
					iconURL: creator.displayAvatarURL(),
					name: creator.displayName,
				})
				.setDescription(
					category.openingMessage
						.replace(/{+\s?(user)?name\s?}+/gi, creator.user.toString())
						.replace(/{+\s?avgResponseTime\s?}+/gi, stats.avgResponseTime)
						.replace(/{+\s?avgResolutionTime\s?}+/gi, stats.avgResolutionTime),
				),
		];

		// TODO: !staff || workingHours

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
		} else if (topic) {
			embeds.push(
				new ExtendedEmbedBuilder()
					.setColor(category.guild.primaryColour)
					.setFields({
						name: getMessage('ticket.opening_message.fields.topic'),
						value: topic,
					}),
			);
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

		/** @type {import("discord.js").Message|undefined} */
		let message;
		if (referencesMessage) {
			referencesMessage = referencesMessage.split('/');
			/** @type {import("discord.js").Message} */
			message = await (await this.client.channels.fetch(referencesMessage[0]))?.messages.fetch(referencesMessage[1]);
			if (message) {
				// not worth the effort of making system messages work atm
				if (message.system) {
					referencesMessage = null;
					message = null;
				} else {
					if (!message.member) {
						try {
							message.member = await message.guild.members.fetch(message.author.id);
						} catch {
							this.client.log.verbose('Failed to fetch member %s of %s', message.author.id, message.guild.id);
						}
					}
					await channel.send({
						embeds: [
							new ExtendedEmbedBuilder()
								.setColor(category.guild.primaryColour)
								.setTitle(getMessage('ticket.references_message.title'))
								.setDescription(
									getMessage('ticket.references_message.description', {
										author: message.author.toString(),
										timestamp: `<t:${Math.ceil(message.createdTimestamp / 1000)}:R>`,
										url: message.url,
									})),
							new ExtendedEmbedBuilder({
								iconURL: guild.iconURL(),
								text: category.guild.footer,
							})
								.setColor(category.guild.primaryColour)
								.setAuthor({
									iconURL: message.member?.displayAvatarURL(),
									name: message.member?.displayName || 'Unknown',
								})
								.setDescription(message.content.substring(0, 1000) + (message.content.length > 1000 ? '...' : '')),
						],
					});

				}

			}
		} else if (referencesTicketId) {
			// TODO: add portal url
			const ticket = await this.client.prisma.ticket.findUnique({ where: { id: referencesTicketId } });
			if (ticket) {
				const embed = new ExtendedEmbedBuilder({
					iconURL: guild.iconURL(),
					text: category.guild.footer,
				})
					.setColor(category.guild.primaryColour)
					.setTitle(getMessage('ticket.references_ticket.title'))
					.setDescription(getMessage('ticket.references_ticket.description'))
					.setFields([
						{
							inline: true,
							name: getMessage('ticket.references_ticket.fields.number'),
							value: inlineCode(ticket.number),
						},
						{
							inline: true,
							name: getMessage('ticket.references_ticket.fields.date'),
							value: `<t:${Math.ceil(ticket.createdAt / 1000)}:f>`,
						},
					]);
				if (ticket.topic) {
					embed.addFields({
						inline: false,
						name: getMessage('ticket.references_ticket.fields.topic'),
						value: ticket.topic,
					});
				}
				await channel.send({ embeds: [embed] });
			}
		}

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
			topic: topic ? encrypt(topic) : null,
		};
		if (referencesTicketId) data.referencesTicket = { connect: { id: referencesTicketId } };
		if (answers) data.questionAnswers = { createMany: { data: answers } };
		await interaction.editReply({
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

		try {
			const ticket = await this.client.prisma.ticket.create({ data });
			this.$count.categories[categoryId].total++;
			this.$count.categories[categoryId][creator.id]++;

			if (category.cooldown) {
				const cacheKey = `cooldowns/category-member:${category.id}-${ticket.createdById}`;
				const expiresAt = ticket.createdAt.getTime() + category.cooldown;
				const TTL = category.cooldown;
				await this.client.keyv.set(cacheKey, expiresAt, TTL);
			}

			if (category.guild.archive && message) {
				let row = await this.client.prisma.archivedMessage.findUnique({ where: { id: message.id } });
				if (!row) row = await this.archiver.saveMessage(ticket.id, message, true);
				if (row) {
					await this.client.prisma.ticket.update({
						data: { referencesMessageId: row.id },
						where: { id: ticket.id },
					});
				}
			}

			logTicketEvent(this.client, {
				action: 'create',
				target: {
					id: ticket.id,
					name: channel.toString(),
				},
				userId: interaction.user.id,
			});
		} catch (error) {
			const ref = require('crypto').randomUUID();
			this.client.log.warn.tickets('An error occurred whilst creating ticket', channel.id);
			this.client.log.error.tickets(ref);
			this.client.log.error.tickets(error);
			await interaction.editReply({
				components: [],
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor('Orange')
						.setTitle(getMessage('misc.error.title'))
						.setDescription(getMessage('misc.error.description'))
						.addFields({
							name: getMessage('misc.error.fields.identifier'),
							value: inlineCode(ref),
						}),
				],
			});
		}
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction|import("discord.js").ButtonInteraction} interaction
	 */
	async claim(interaction) {
		const ticket = await this.client.prisma.ticket.findUnique({
			include: {
				_count: { select: { questionAnswers: true } },
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});
		const getMessage = this.client.i18n.getLocale(ticket.guild.locale);

		await interaction.channel.permissionOverwrites.edit(interaction.user, { 'ViewChannel': true }, `Ticket claimed by ${interaction.user.tag}`);

		for (const role of ticket.category.staffRoles) await interaction.channel.permissionOverwrites.edit(role, { 'ViewChannel': false }, `Ticket claimed by ${interaction.user.tag}`);

		await this.client.prisma.ticket.update({
			data: {
				claimedBy: {
					connectOrCreate: {
						create: { id: interaction.user.id },
						where: { id: interaction.user.id },
					},
				},
			},
			where: { id: interaction.channel.id },
		});

		const openingMessage = await interaction.channel.messages.fetch(ticket.openingMessageId);

		if (openingMessage && openingMessage.components.length !== 0) {
			const components = new ActionRowBuilder();

			if (ticket.topic || ticket._count.questionAnswers !== 0) {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'edit' }))
						.setStyle(ButtonStyle.Secondary)
						.setEmoji(getMessage('buttons.edit.emoji'))
						.setLabel(getMessage('buttons.edit.text')),
				);
			}

			if (ticket.guild.claimButton && ticket.category.claiming) {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'unclaim' }))
						.setStyle(ButtonStyle.Secondary)
						.setEmoji(getMessage('buttons.unclaim.emoji'))
						.setLabel(getMessage('buttons.unclaim.text')),
				);
			}

			if (ticket.guild.closeButton) {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'close' }))
						.setStyle(ButtonStyle.Danger)
						.setEmoji(getMessage('buttons.close.emoji'))
						.setLabel(getMessage('buttons.close.text')),
				);
			}

			await openingMessage.edit({ components: [components] });
		}

		await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder()
					.setColor(ticket.guild.primaryColour)
					.setDescription(getMessage('ticket.claimed', { user: interaction.user.toString() })),
			],
		});

		logTicketEvent(this.client, {
			action: 'claim',
			target: {
				id: ticket.id,
				name: interaction.channel.toString(),
			},
			userId: interaction.user.id,
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction|import("discord.js").ButtonInteraction} interaction
	 */
	async release(interaction) {
		const ticket = await this.client.prisma.ticket.findUnique({
			include: {
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});
		const getMessage = this.client.i18n.getLocale(ticket.guild.locale);

		await interaction.channel.permissionOverwrites.delete(interaction.user, `Ticket released by ${interaction.user.tag}`);

		for (const role of ticket.category.staffRoles) await interaction.channel.permissionOverwrites.edit(role, { 'ViewChannel': true }, `Ticket released by ${interaction.user.tag}`);

		await this.client.prisma.ticket.update({
			data: { claimedBy: { disconnect: true } },
			where: { id: interaction.channel.id },
		});

		const openingMessage = await interaction.channel.messages.fetch(ticket.openingMessageId);

		if (openingMessage && openingMessage.components.length !== 0) {
			const components = new ActionRowBuilder();

			if (ticket.topic || ticket._count.questionAnswers !== 0) {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'edit' }))
						.setStyle(ButtonStyle.Secondary)
						.setEmoji(getMessage('buttons.edit.emoji'))
						.setLabel(getMessage('buttons.edit.text')),
				);
			}

			if (ticket.guild.claimButton && ticket.category.claiming) {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'claim' }))
						.setStyle(ButtonStyle.Secondary)
						.setEmoji(getMessage('buttons.claim.emoji'))
						.setLabel(getMessage('buttons.claim.text')),
				);
			}

			if (ticket.guild.closeButton) {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({ action: 'close' }))
						.setStyle(ButtonStyle.Danger)
						.setEmoji(getMessage('buttons.close.emoji'))
						.setLabel(getMessage('buttons.close.text')),
				);
			}

			await openingMessage.edit({ components: [components] });
		}

		await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder()
					.setColor(ticket.guild.primaryColour)
					.setDescription(getMessage('ticket.released', { user: interaction.user.toString() })),
			],
		});

		logTicketEvent(this.client, {
			action: 'unclaim',
			target: {
				id: ticket.id,
				name: interaction.channel.toString(),
			},
			userId: interaction.user.id,
		});
	}

	buildFeedbackModal(locale, id) {
		const getMessage = this.client.i18n.getLocale(locale);
		return new ModalBuilder()
			.setCustomId(JSON.stringify({
				action: 'feedback',
				...id,
			}))
			.setTitle(getMessage('modals.feedback.title'))
			.setComponents(
				new ActionRowBuilder()
					.setComponents(
						new TextInputBuilder()
							.setCustomId('rating')
							.setLabel(getMessage('modals.feedback.rating.label'))
							.setStyle(TextInputStyle.Short)
							.setMaxLength(3)
							.setMinLength(1)
							.setPlaceholder(getMessage('modals.feedback.rating.placeholder'))
							.setRequired(true),
					),
				new ActionRowBuilder()
					.setComponents(
						new TextInputBuilder()
							.setCustomId('comment')
							.setLabel(getMessage('modals.feedback.comment.label'))
							.setStyle(TextInputStyle.Paragraph)
							.setMaxLength(1000)
							.setMinLength(4)
							.setPlaceholder(getMessage('modals.feedback.comment.placeholder'))
							.setRequired(false),
					),
			);
	}


	/**
	 * @param {import("discord.js").ChatInputCommandInteraction|import("discord.js").ButtonInteraction} interaction
	 */
	async beforeRequestClose(interaction) {
		const ticket = await this.client.prisma.ticket.findUnique({
			include: {
				category: { select: { enableFeedback: true } },
				feedback: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});

		if (!ticket) {
			await interaction.deferReply({ ephemeral: true });
			const {
				errorColour,
				locale,
			} = await this.client.prisma.guild.findUnique({
				select: {
					errorColour: true,
					locale: true,
				},
				where: { id: interaction.guild.id },
			});
			const getMessage = this.client.i18n.getLocale(locale);
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(errorColour)
						.setTitle(getMessage('misc.not_ticket.title'))
						.setDescription(getMessage('misc.not_ticket.description')),
				],
			});
		}

		const getMessage = this.client.i18n.getLocale(ticket.guild.locale);
		const staff = await isStaff(interaction.guild, interaction.user.id);
		const reason = interaction.options?.getString('reason', false) || null; // ?. because it could be a button interaction

		if (ticket.createdById !== interaction.user.id && !staff) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('ticket.close.forbidden.title'))
						.setDescription(getMessage('ticket.close.forbidden.description')),
				],
			});
		}

		if (
			ticket.createdById === interaction.user.id &&
			ticket.category.enableFeedback &&
			!ticket.feedback
		) {
			return await interaction.showModal(this.buildFeedbackModal(ticket.guild.locale, {
				next: 'requestClose',
				reason, // known issue: a reason longer than a few words will cause an error due to 100 character ID limit
			}));
		}

		// not showing feedback, so send the close request

		// defer asap
		await interaction.deferReply();

		// if the creator isn't in the guild , close the ticket immediately
		// (although leaving should cause the ticket to be closed anyway)
		try {
			await interaction.guild.members.fetch(ticket.createdById);
		} catch {
			return this.finallyClose(ticket.id, { reason });
		}

		await this.requestClose(interaction, reason);
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction|import("discord.js").ButtonInteraction|import("discord.js").ModalSubmitInteraction} interaction
	 * @param {string} reason
	 */
	async requestClose(interaction, reason) {
		// interaction could be command, button. or modal
		const ticket = await this.client.prisma.ticket.findUnique({
			include: { guild: true },
			where: { id: interaction.channel.id },
		});
		const getMessage = this.client.i18n.getLocale(ticket.guild.locale);
		const staff = await isStaff(interaction.guild, interaction.user.id);
		const closeButtonId = {
			action: 'close',
			expect: staff ? 'user' : 'staff',
		};
		const embed = new ExtendedEmbedBuilder({
			iconURL: interaction.guild.iconURL(),
			text: ticket.guild.footer,
		})
			.setColor(ticket.guild.primaryColour)
			.setTitle(getMessage(`ticket.close.${staff ? 'staff' : 'user'}_request.title`, { requestedBy: interaction.member.displayName }));

		if (staff) {
			embed.setDescription(
				getMessage('ticket.close.staff_request.description', { requestedBy: interaction.user.toString() }) +
				(ticket.guild.archive ? getMessage('ticket.close.staff_request.archived') : ''),
			);
		}

		const sent = await interaction.editReply({
			components: [
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId(JSON.stringify({
								accepted: true,
								...closeButtonId,
							}))
							.setStyle(ButtonStyle.Success)
							.setEmoji(getMessage('buttons.accept_close_request.emoji'))
							.setLabel(getMessage('buttons.accept_close_request.text')),
						new ButtonBuilder()
							.setCustomId(JSON.stringify({
								accepted: false,
								...closeButtonId,
							}))
							.setStyle(ButtonStyle.Danger)
							.setEmoji(getMessage('buttons.reject_close_request.emoji'))
							.setLabel(getMessage('buttons.reject_close_request.text')),
					),
			],
			content: staff ? `<@${ticket.createdById}>` : '', // ticket.category.pingRoles.map(r => `<@&${r}>`).join(' ')
			embeds: [embed],
		});

		this.$stale.set(ticket.id, {
			closeAt: ticket.guild.autoClose ? Date.now() + ticket.guild.autoClose : null,
			closedBy: interaction.user.id, // null if set as stale due to inactivity
			message: sent,
			messages: 0,
			reason,
			staleSince: Date.now(),
		});

		if (ticket.priority && ticket.priority !== 'LOW') {
			await this.client.prisma.ticket.update({
				data: { priority: 'LOW' },
				where: { id: ticket.id },
			});
		}
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction|import("discord.js").ButtonInteraction|import("discord.js").ModalSubmitInteraction} interaction
	 */
	async acceptClose(interaction) {}

	/**
	 * close a ticket
	 * @param {string} ticketId
	 */
	async finallyClose(ticketId, {
		closedBy,
		reason,
	}) {
		// TODO: update cache/cat count
		// TODO: update cache/member count
		// TODO: set messageCount on ticket
		// TODO: pinnedMessages, closedBy, closedAt
		// delete
	}
};