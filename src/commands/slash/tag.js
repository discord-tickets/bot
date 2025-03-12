const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');

module.exports = class TagSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'tag';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
			options: [
				{
					autocomplete: true,
					name: 'tag',
					required: true,
					type: ApplicationCommandOptionType.Integer,
				},
				{
					name: 'for',
					required: false,
					type: ApplicationCommandOptionType.User,
				},
			].map(option => {
				option.descriptionLocalizations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.description`);
				option.description = option.descriptionLocalizations['en-GB'];
				option.nameLocalizations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.name`);
				return option;
			}),
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		try {
			const user = interaction.options.getUser('for', false);
			
			try {
				await interaction.deferReply({ ephemeral: !user });
			} catch (deferError) {
				client.log.error(`Error deferring reply in tag command: ${deferError}`);
				// If we can't defer, try to respond directly
				if (!interaction.replied && !interaction.deferred) {
					return await interaction.reply({ 
						content: 'There was an error processing this command. Please try again.',
						ephemeral: true 
					}).catch(console.error);
				}
				return;
			}

			// Fetch the tag
			const tag = await client.prisma.tag.findUnique({
				include: { guild: true },
				where: { id: interaction.options.getInteger('tag', true) },
			});

			// Check if tag exists
			if (!tag) {
				return await interaction.editReply({
					content: 'This tag does not exist.',
					ephemeral: true
				}).catch(console.error);
			}

			// Create the embed with support for images
			const embed = new ExtendedEmbedBuilder()
				.setColor(tag.guild.primaryColour)
				.setDescription(tag.content);
			
			// If the tag has an image URL, add it to the embed
			if (tag.imageUrl) {
				embed.setImage(tag.imageUrl);
			}

			// Send the response
			await interaction.editReply({
				allowedMentions: { users: user ? [user.id] : [] },
				content: user?.toString() || null,
				embeds: [embed],
			}).catch(error => {
				client.log.error(`Error editing reply in tag command: ${error}`);
			});
			
		} catch (error) {
			client.log.error(`Error in tag command: ${error}`);
			
			// Try to respond to the user about the error
			try {
				if (interaction.deferred) {
					await interaction.editReply({
						content: 'An error occurred while fetching the tag.',
						ephemeral: true
					});
				} else if (!interaction.replied) {
					await interaction.reply({
						content: 'An error occurred while fetching the tag.',
						ephemeral: true
					});
				}
			} catch (responseError) {
				client.log.error(`Failed to send error response: ${responseError}`);
			}
		}
	}
};