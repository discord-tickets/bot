const { SlashCommand } = require('@eartharoid/dbf');
const { isStaff } = require('../../lib/users');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { version } = require('../../../package.json');

module.exports = class ClaimSlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.help.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.help.name')));

		super(client, {
			...options,
			description: descriptionLocalizations['en-GB'],
			descriptionLocalizations,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ ephemeral: true });
		const staff = await isStaff(interaction.guild, interaction.member.id);
		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
		const getMessage = client.i18n.getLocale(settings.locale);
		const commands = (await client.application.commands.fetch())
			.filter(c => c.type === 1)
			.map(c => `> </${c.name}:${c.id}>: ${c.description}`)
			.join('\n');
		const ticket = client.application.commands.cache.find(c => c.name === 'new');
		const fields = [
			{
				name: getMessage('commands.slash.help.response.commands'),
				value: commands,
			},
		];

		if (staff) {
			fields.unshift(
				{
					inline: true,
					name: getMessage('commands.slash.help.response.links.links'),
					value: [
						['commands', 'https://discordtickets.app/features/commands'],
						['docs', 'https://discordtickets.app'],
						['feedback', 'https://lnk.earth/dsctickets-feedback'],
						['support', 'https://lnk.earth/discord'],
					]
						.map(([l, url]) => `> [${getMessage('commands.slash.help.response.links.' + l)}](${url})`)
						.join('\n'),
				},
				{
					inline: true,
					name: getMessage('commands.slash.help.response.settings'),
					value: '> ' + process.env.HTTP_EXTERNAL + '/settings',
				},
			);
		}

		interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: interaction.guild.iconURL(),
					text: settings.footer,
				})
					.setColor(settings.primaryColour)
					.setTitle(getMessage('commands.slash.help.title'))
					.setDescription(staff
						? `**Discord Tickets v${version} by eartharoid.**`
						: getMessage('commands.slash.help.response.description', { command: `</${ticket.name}:${ticket.id}>` }))
					.setFields(fields),
			],
		});
	}
};