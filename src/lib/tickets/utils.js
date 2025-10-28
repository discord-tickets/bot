const {
	ActionRowBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	MessageFlags,
} = require('discord.js');
const emoji = require('node-emoji');

module.exports = {
	/**
	 * @param {import("client")} client
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction} interaction
	 */
	async useGuild(client, interaction, {
		referencesMessageId,
		referencesTicketId,
		topic,
	}) {
		const settings = await client.prisma.guild.findUnique({
			select: {
				categories: true,
				errorColour: true,
				locale: true,
				primaryColour: true,
			},
			where: { id: interaction.guild.id },
		});
		const getMessage = client.i18n.getLocale(settings.locale);
		if (settings.categories.length === 0) {
			interaction.reply({
				components: [],
				embeds: [
					new EmbedBuilder()
						.setColor(settings.errorColour)
						.setTitle(getMessage('misc.no_categories.title'))
						.setDescription(getMessage('misc.no_categories.description', { url: `${process.env.HTTP_EXTERNAL}/settings/${interaction.guildId}` })),
				],
				flags: MessageFlags.Ephemeral,
			});
		} else if (settings.categories.length === 1) {
			await client.tickets.create({
				categoryId: settings.categories[0].id,
				interaction,
				referencesMessageId,
				referencesTicketId,
				topic,
			});
		} else {
			await interaction.reply({
				components: [
					new ActionRowBuilder()
						.setComponents(
							new StringSelectMenuBuilder()
								.setCustomId(JSON.stringify({
									action: 'create',
									referencesMessageId,
									referencesTicketId,
									topic,
								}))
								.setPlaceholder(getMessage('menus.category.placeholder'))
								.setOptions(
									settings.categories.map(category =>
										new StringSelectMenuOptionBuilder()
											.setValue(String(category.id))
											.setLabel(category.name)
											.setDescription(category.description)
											.setEmoji(emoji.hasEmoji(category.emoji) ? emoji.get(category.emoji) : { id: category.emoji }),
									),
								),
						),
				],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
