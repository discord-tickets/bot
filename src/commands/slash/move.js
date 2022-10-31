const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');

module.exports = class MoveSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'move';
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
					name: 'category',
					required: true,
					type: ApplicationCommandOptionType.Integer,
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

		await interaction.deferReply({ ephemeral: false });

		const ticket = await client.prisma.ticket.findUnique({
			include: {
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});

		if (!ticket) {
			const { locale } = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
			const getMessage = client.i18n.getLocale(locale);
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('misc.not_ticket.title'))
						.setDescription(getMessage('misc.not_ticket.description')),
				],
				ephemeral: true,
			});
		}

		const newCategory = await client.prisma.category.findUnique({ where: { id: interaction.options.getInteger('category', true) } });
		const discordCategory = await interaction.guild.channels.fetch(newCategory.discordCategory);
		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		if (discordCategory.children.cache.size === 50) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('misc.category_full.title'))
						.setDescription(getMessage('misc.category_full.description')),
				],
				ephemeral: true,
			});
		} else {
			await client.prisma.ticket.update({
				data: { category: { connect: { id: newCategory.id } } },
				where: { id: ticket.id },
			});

			const $oldCategory = client.tickets.$.categories[ticket.categoryId];
			const $newCategory = client.tickets.$.categories[newCategory.id];

			$oldCategory.total--;
			$oldCategory[ticket.createdById]--;

			if (!$newCategory.total) $newCategory.total = 0;
			$newCategory.total++;

			if (!$newCategory[ticket.createdById]) $newCategory[ticket.createdById] = 0;
			$newCategory[ticket.createdById]++;

			await interaction.channel.setParent(discordCategory, {
				lockPermissions: false,
				reason: `Moved by ${interaction.user.tag}`,
			});

			await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(ticket.guild.primaryColour)
						.setDescription(getMessage('commands.slash.move.moved', {
							by: interaction.user.toString(),
							from: ticket.category.name,
							to: newCategory.name,
						})),
				],
			});

		}
	}
};
