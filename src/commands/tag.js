const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class TagCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.tag.description'),
			internal: true,
			name: i18n('commands.tag.name'),
			options: async guild => {
				const settings = await client.utils.getSettings(guild.id);
				return Object.keys(settings.tags).map(tag => ({
					description: settings.tags[tag].substring(0, 100),
					name: tag,
					options: [...settings.tags[tag].matchAll(/(?<!\\){{1,2}\s?([A-Za-z0-9._:]+)\s?(?<!\\)}{1,2}/gi)]
						.map(match => ({
							description: match[1],
							name: match[1],
							required: true,
							type: Command.option_types.STRING
						})),
					required: true,
					type: Command.option_types.SUB_COMMAND
				}));
			},
			staff_only: true
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const tag_name = interaction.options.getSubcommand();
		const tag = settings.tags[tag_name];
		const args = interaction.options.data[0]?.options;

		if (tag) {
			const text = tag.replace(/(?<!\\){{1,2}\s?([A-Za-z0-9._:]+)\s?(?<!\\)}{1,2}/gi, ($, $1) => {
				const arg = args.find(arg => arg.name === $1);
				return arg ? arg.value : $;
			});
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setDescription(text)
				],
				ephemeral: false
			});
		} else {
			const list = Object.keys(settings.tags).map(t => `❯ **\`${t}\`**`);
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setTitle(i18n('commands.tag.response.list.title'))
						.setDescription(list.join('\n'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

	}
};
