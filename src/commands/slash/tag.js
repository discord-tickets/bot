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

		const user = interaction.options.getUser('for', false);
		await interaction.deferReply({ ephemeral: !user });
		const tag = await client.prisma.tag.findUnique({
			include: { guild: true },
			where: { id: interaction.options.getInteger('tag', true) },
		});

		await interaction.editReply({
			allowedMentions: { users: user ? [user.id]: [] },
			content: user?.toString(),
			embeds: [
				new ExtendedEmbedBuilder()
					.setColor(tag.guild.primaryColour)
					.setDescription(tag.content),
			],
		});
	}
};
