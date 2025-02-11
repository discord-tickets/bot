const { SlashCommand } = require('@eartharoid/dbf');
const ExtendedEmbedBuilder = require('../../lib/embed');
const {
	MessageFlags,
	ApplicationCommandOptionType,
} = require('discord.js');
const { isStaff } = require('../../lib/users');
const ms = require('ms');

module.exports = class RenameSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'rename';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalisations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalisations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
			options: [
				{
					name: 'new_name',
					required: true,
					type: ApplicationCommandOptionType.String,
				},
			].map(option => {
				option.descriptionLocalisations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.description`);
				option.description = option.descriptionLocalisations['en-GB'];
				option.nameLocalisations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.name`);
				return option;
			}),
		});
	}

	/**
	 * Handle the 'rename' command
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		// Defer the reply while processing the request
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Fetch the necessary ticket data for the channel
		const ticket = await client.prisma.ticket.findUnique({
			include: {
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});

		// Fetch guild settings
		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });

		if (!ticket) {
			// If no ticket found for the channel, return an error
			const getMessage = client.i18n.getLocale(settings.locale);
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.errorColour)
						.setTitle(getMessage('misc.not_ticket.title'))
						.setDescription(getMessage('misc.not_ticket.description')),
				],
			});
		}

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		// Check if the user has permission to rename the channel
		if (
			ticket.id !== interaction.channel.id &&
			ticket.createdById !== interaction.member.id &&
			!(await isStaff(interaction.guild, interaction.member.id))
		) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('commands.slash.rename.not_staff.title'))
						.setDescription(getMessage('commands.slash.rename.not_staff.description')),
				],
			});
		}

		const newName = interaction.options.getString('new_name'); // Get the new name from the user's input

		// Validate the new name length (must be between 1 and 100 characters)
		if (newName.length < 1 || newName.length > 100) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: getMessage('misc.rename.error'),
					})
						.setColor(settings.errorColour)
						.setTitle(getMessage('commands.slash.rename.invalid_title'))
						.setDescription(getMessage('commands.slash.rename.invalid_description')),
				],
			});
		}

		// Check for rate limit for renaming the channel (allowing 2 renames every 10 minutes)
		const rateLimitKey = `rate-limits/channel-rename:${interaction.channel.id}`;
		let renameTimestamps = await this.client.keyv.get(rateLimitKey) ?? [];

		// Remove any timestamps older than 10 minutes
		renameTimestamps = renameTimestamps.filter(timestamp => Date.now() - timestamp < ms('10m'));

		if (renameTimestamps.length >= 2) {
			// If two renames have already occurred in the last 10 minutes, return rate limited
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: getMessage('commands.slash.rename.ratelimited.title'),
					})
						.setColor(settings.errorColour)
						.setTitle(getMessage('commands.slash.rename.ratelimited.title'))
						.setDescription(getMessage('commands.slash.rename.ratelimited.description')),
				],
				ephemeral: true,
			});
		}

		// Add the current timestamp to the array
		renameTimestamps.push(Date.now());
		await this.client.keyv.set(rateLimitKey, renameTimestamps, ms('10m'));

		// Proceed with renaming the channel
		await interaction.channel.edit({ name: newName });

		// Respond with a success message
		await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: interaction.guild.iconURL(),
					text: getMessage('commands.slash.rename.success'),
				})
					.setColor(settings.successColour)
					.setTitle(getMessage('commands.slash.rename.success_title'))
					.setDescription(getMessage('commands.slash.rename.success_description')),
			],
		});
	}
};
