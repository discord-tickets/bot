const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class TopicCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.topic.description'),
			internal: true,
			name: i18n('commands.topic.name'),
			options: [
				{
					description: i18n('commands.topic.options.new_topic.description'),
					name: i18n('commands.topic.options.new_topic.name'),
					required: true,
					type: Command.option_types.STRING
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const default_i18n = this.client.i18n.getLocale(this.client.config.defaults.locale);  // command properties could be in a different locale
		const i18n = this.client.i18n.getLocale(settings.locale);

		const topic = interaction.options.getString(default_i18n('commands.topic.options.new_topic.name'));

		const t_row = await this.client.db.models.Ticket.findOne({ where: { id: interaction.channel.id } });

		if (!t_row) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.topic.response.not_a_ticket.title'))
						.setDescription(i18n('commands.topic.response.not_a_ticket.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		await t_row.update({ topic: this.client.cryptr.encrypt(topic) });

		const member = await interaction.guild.members.fetch(t_row.creator);
		interaction.channel.setTopic(`${member} | ${topic}`, { reason: 'User updated ticket topic' });

		const cat_row = await this.client.db.models.Category.findOne({ where: { id: t_row.category } });
		const description = cat_row.opening_message
			.replace(/{+\s?(user)?name\s?}+/gi, member.displayName)
			.replace(/{+\s?(tag|ping|mention)?\s?}+/gi, member.user.toString());
		const opening_message = await interaction.channel.messages.fetch(t_row.opening_message);

		await opening_message.edit({
			embeds: [
				new MessageEmbed()
					.setColor(settings.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setDescription(description)
					.addField(i18n('ticket.opening_message.fields.topic'), topic)
					.setFooter(settings.footer, interaction.guild.iconURL())
			]
		});

		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(settings.success_colour)
					.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
					.setTitle(i18n('commands.topic.response.changed.title'))
					.setDescription(i18n('commands.topic.response.changed.description'))
					.setFooter(settings.footer, interaction.guild.iconURL())
			],
			ephemeral: false
		});

		this.client.log.info(`${interaction.user.tag} changed the topic of #${interaction.channel.name}`);
	}
};
