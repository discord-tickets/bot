const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType, ThreadAutoArchiveDuration, MessageFlags } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');
const { logTicketEvent } = require('../../lib/logging');

module.exports = class NoteSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'note';
		super(client, {
			...options,
			description: 'Create a staff note about the current ticket',
			dmPermission: false,
			name,
			options: [
				{
					name: 'text',
					description: 'The note content',
					required: true,
					type: ApplicationCommandOptionType.String,
				},
			],
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		// Use flags instead of ephemeral parameter
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Check if the command is being used in a ticket channel
		const ticket = await client.prisma.ticket.findUnique({
			include: { 
				guild: true,
				category: true,
				createdBy: true 
			},
			where: { id: interaction.channel.id },
		});

		if (!ticket) {
			const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.errorColour)
						.setTitle('❌ This isn\'t a ticket channel')
						.setDescription('You can only use this command in tickets.'),
				],
			});
		}

		// Check if user is staff
		if (!(await isStaff(interaction.guild, interaction.user.id))) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle('❌ Access Denied')
						.setDescription('Only staff members can create notes.'),
				],
			});
		}

		// Check if log channel exists
		if (!ticket.guild.logChannel) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle('⚠️ Configuration Error')
						.setDescription('No log channel has been configured for this server. Please ask an administrator to set up a log channel.'),
				],
			});
		}

		// Get the log channel
		const logChannel = await client.channels.fetch(ticket.guild.logChannel).catch(() => null);
		if (!logChannel) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(), 
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle('⚠️ Channel Error')
						.setDescription('The configured log channel could not be found. Please ask an administrator to check the configuration.'),
				],
			});
		}

		const noteText = interaction.options.getString('text', true);
		const threadName = `💬 Staff Notes - ${ticket.category.name} #${ticket.number}`;

		try {
			// Check if a thread for this ticket already exists in the log channel
			let thread = logChannel.threads.cache.find(t => 
				t.name === threadName || 
				t.name.includes(`#${ticket.number}`) && t.name.includes('Staff Notes')
			);

			if (!thread) {
				// Create a new message in the log channel that will host the thread
				const threadStartMessage = await logChannel.send({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: ticket.guild.footer,
						})
							.setColor(ticket.guild.primaryColour)
							.setTitle(`📝 Staff Notes - ${ticket.category.name} #${ticket.number}`)
							.setDescription(`Thread for staff notes about ticket #${ticket.number}`)
							.addFields([
								{
									name: 'Ticket',
									value: `<#${ticket.id}>`,
									inline: true
								},
								{
									name: 'Created by',
									value: ticket.createdBy ? `<@${ticket.createdBy.id}>` : 'Unknown',
									inline: true
								}
							])
							.setFooter({
								text: `Ticket ID: ${ticket.id}`,
							})
							.setTimestamp(),
					],
				});

				// Create a thread on this message
				thread = await threadStartMessage.startThread({
					name: threadName,
					autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
					reason: `Staff notes for ticket #${ticket.number}`
				});

				// Send welcome message in the thread
				await thread.send({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: ticket.guild.footer,
						})
							.setColor(ticket.guild.primaryColour)
							.setTitle('📝 Staff Notes Thread')
							.setDescription(
								'This is a private thread for staff notes about this ticket. ' +
								'All notes will be preserved here for future reference.\n\n' +
								`Link to ticket: <#${ticket.id}>`
							)
					],
				});
			}

			// Add the user to the thread
			await thread.members.add(interaction.user.id);

			// Post the note in the thread
			await thread.send({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.primaryColour)
						.setDescription(noteText)
						.setAuthor({
							iconURL: interaction.user.displayAvatarURL(),
							name: interaction.member.displayName,
						})
						.setTimestamp(),
				],
			});

			// Send a confirmation message
			await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.successColour)
						.setTitle('✅ Note Added')
						.setDescription(`Your note has been added to the staff thread: ${thread}`)
				],
			});

			// Log the creation event if this is a new thread
			if (thread.createdTimestamp > Date.now() - 5000) {
				logTicketEvent(this.client, {
					action: 'update',
					diff: {
						original: {},
						updated: { 'Staff Notes': 'Thread created in logs channel' },
					},
					target: {
						id: ticket.id,
						name: `<#${ticket.id}>`,
					},
					userId: interaction.user.id,
				});
			}

		} catch (error) {
			client.log.error('Error creating staff note thread:', error);
			
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle('⚠️ Error')
						.setDescription('Failed to create the staff note. Please try again.'),
				],
			});
		}
	}
};
