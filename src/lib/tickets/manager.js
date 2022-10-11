/* eslint-disable max-lines */
const TicketArchiver = require('./archiver');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
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
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);

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
		this.$ = { categories: {} };
	}

	async getCategory(categoryId) {
		const cacheKey = `cache/category+guild+questions:${categoryId}`;
		/** @type {CategoryGuildQuestions} */
		let category = await this.client.keyv.get(cacheKey);
		if (!category) {
			category = await this.client.prisma.category.findUnique({
				include: {
					guild: true,
					questions: { orderBy: { order: 'asc' } },
				},
				where: { id: categoryId },
			});
			this.client.keyv.set(cacheKey, category, ms('5m'));
		}
		return category;
	}

	// TODO: update when a ticket is closed or moved
	async getTotalCount(categoryId) {
		const category = this.$.categories[categoryId];
		if (!category) this.$.categories[categoryId] = {};
		let count = this.$.categories[categoryId].total;
		if (!count) {
			count = await this.client.prisma.ticket.count({
				where: {
					categoryId,
					open: true,
				},
			});
			this.$.categories[categoryId].total = count;
		}
		return count;
	}

	// TODO: update when a ticket is closed or moved
	async getMemberCount(categoryId, memberId) {
		const category = this.$.categories[categoryId];
		if (!category) this.$.categories[categoryId] = {};
		let count = this.$.categories[categoryId][memberId];
		if (!count) {
			count = await this.client.prisma.ticket.count({
				where: {
					categoryId: categoryId,
					createdById: memberId,
					open: true,
				},
			});
			this.$.categories[categoryId][memberId] = count;
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

		const cacheKey = `cache/category+guild+questions:${categoryId}`;
		/** @type {CategoryGuildQuestions} */
		const category = await this.client.keyv.get(cacheKey);

		let answers;
		if (interaction.isModalSubmit()) {
			if (action === 'questions') {
				answers = category.questions.map(q => ({
					questionId: q.id,
					userId: interaction.user.id,
					value: interaction.fields.getTextInputValue(q.id) ? cryptr.encrypt(interaction.fields.getTextInputValue(q.id)) : '',
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
			topic: topic ? cryptr.encrypt(topic) : null,
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
			this.$.categories[categoryId].total++;
			this.$.categories[categoryId][creator.id]++;

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
	async preClose(interaction) {
		const ticket = await this.client.prisma.ticket.findUnique({
			include: {
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});
		const getMessage = this.client.i18n.getLocale(ticket.guild.locale);
	}

	/**
	 * close a ticket
	 * @param {string} ticketId
	 * @param {boolean} skip
	 * @param {string} reason
	 */
	async close(ticketId, skip, reason) {
		// TODO: update cache/cat count
		// TODO: update cache/member count
		// TODO: set messageCount on ticket
		// delete
	}
};