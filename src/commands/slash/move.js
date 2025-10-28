const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType, MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');
const { getEmoji } = require('./priority');
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

		await interaction.deferReply();

		const ticket = await client.prisma.ticket.findUnique({
			include: {
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
		});

		if (!ticket) {
			const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
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
				flags: MessageFlags.Ephemeral,
			});
		}

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		if (!(await isStaff(interaction.guild, interaction.user.id))) { // if user is not staff
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('commands.slash.move.not_staff.title'))
						.setDescription(getMessage('commands.slash.move.not_staff.description')),
				],
			});
		}

		const creator = await interaction.guild.members.fetch(ticket.createdById);
		const newCategory = await client.prisma.category.findUnique({ where: { id: interaction.options.getInteger('category', true) } });
		const discordCategory = await interaction.guild.channels.fetch(newCategory.discordCategory);

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
				flags: MessageFlags.Ephemeral,
			});
		} else {
			// don't reassign `ticket`, the previous value is used below
			await client.prisma.ticket.update({
				data: { category: { connect: { id: newCategory.id } } },
				where: { id: ticket.id },
			});

			// alias
			const $counters = client.tickets.$count.categories;

			// make sure new category exist (#531)
			$counters[newCategory.id] ??= {};

			// more specific aliases
			const $oldCategory = $counters[ticket.categoryId];
			const $newCategory = $counters[newCategory.id];

			// decrement old's total and member count
			$oldCategory.total--;
			$oldCategory[ticket.createdById]--;

			// increment new's totaL count
			$newCategory.total ||= 0;
			$newCategory.total++;

			// increment new's member count
			$newCategory[ticket.createdById] ||= 0;
			$newCategory[ticket.createdById]++;

			// these 3 could be done separately,
			// but using `setParent`, `setName` etc instead of a single `edit` call increases the number of API requests
			if (
				newCategory.staffRoles !== ticket.category.staffRoles ||
				newCategory.channelName !== ticket.category.channelName ||
				newCategory.discordCategory !== ticket.category.discordCategory
			) {
				const allow = ['ViewChannel', 'ReadMessageHistory', 'SendMessages', 'EmbedLinks', 'AttachFiles'];
				const channelName = newCategory.channelName
					.replace(/{+\s?(user)?name\s?}+/gi, creator.user.username)
					.replace(/{+\s?(nick|display)(name)?\s?}+/gi, creator.displayName)
					.replace(/{+\s?num(ber)?\s?}+/gi, ticket.number === 1488 ? '1487b' : ticket.number);
				await interaction.channel.edit({
					lockPermissions: false,
					name: ticket.priority ? getEmoji(ticket.priority) + channelName : channelName,
					parent: discordCategory,
					permissionOverwrites: [
						{
							deny: ['ViewChannel'],
							id: interaction.guild.roles.everyone,
						},
						{
							allow,
							id: this.client.user.id,
						},
						{
							allow,
							id: creator.id,
						},
						...newCategory.staffRoles.map(id => ({
							allow,
							id,
						})),
					],
					reason: `Moved by ${interaction.user.tag}`,
				});
			}

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
