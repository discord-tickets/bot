const { UserCommand } = require('@eartharoid/dbf');
const { isStaff } = require('../../lib/users');
const ExtendedEmbedBuilder = require('../../lib/embed');
const ms = require('ms');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} = require('discord.js');
const emoji = require('node-emoji');

module.exports = class CreateUserCommand extends UserCommand {
	constructor(client, options) {
		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.user.create.name')));

		super(client, {
			...options,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
		});
	}

	/**
	 * @param {import("discord.js").UserContextMenuCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ ephemeral: true });

		const settings = await client.prisma.guild.findUnique({
			include: { categories:true },
			where: { id: interaction.guild.id },
		});
		const getMessage = client.i18n.getLocale(settings.locale);

		if (!await isStaff(interaction.guild, interaction.user.id)) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.errorColour)
						.setTitle(getMessage('commands.user.create.not_staff.title'))
						.setDescription(getMessage('commands.user.create.not_staff.description')),
				],
			});
		}

		const prompt = async categoryId => {
			interaction.followUp({
				components: [
					new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(JSON.stringify({
									action: 'create',
									target: categoryId,
									targetUser: interaction.targetId,
								}))
								.setStyle(ButtonStyle.Primary)
								.setEmoji(getMessage('buttons.create.emoji')) // emoji.get('ticket')
								.setLabel(getMessage('buttons.create.text')),
						),
				],
				content: interaction.targetUser.toString(),
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(settings.primaryColour)
						.setAuthor({
							iconURL: interaction.member.displayAvatarURL(),
							name: interaction.member.displayName,
						})
						.setTitle(getMessage('commands.user.create.prompt.title'))
						.setDescription(getMessage('commands.user.create.prompt.description')),
				],
				ephemeral: false,
			});
		};

		if (settings.categories.length === 0) {
			interaction.reply({
				components: [],
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(settings.errorColour)
						.setTitle(getMessage('misc.no_categories.title'))
						.setDescription(getMessage('misc.no_categories.description')),
				],
				ephemeral: true,
			});
		} else if (settings.categories.length === 1) {
			await prompt(settings.categories[0].id);
		} else {
			const collectorTime = ms('15s');
			const confirmationM = await interaction.editReply({
				components: [
					new ActionRowBuilder()
						.setComponents(
							new StringSelectMenuBuilder()
								.setCustomId(JSON.stringify({
									action: 'promptCreate',
									user: interaction.targetId,
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
			});

			confirmationM.awaitMessageComponent({
				componentType: ComponentType.StringSelect,
				filter: i => i.user.id === interaction.user.id,
				time: collectorTime,
			})
				.then(async i => {
					const category = settings.categories.find(c => c.id === Number(i.values[0]));
					await i.update({
						components: [],
						embeds: [
							new ExtendedEmbedBuilder({
								iconURL: interaction.guild.iconURL(),
								text: settings.footer,
							})
								.setColor(settings.successColour)
								.setTitle(getMessage('commands.user.create.sent.title'))
								.setDescription(getMessage('commands.user.create.sent.description', {
									category: category.name,
									user: interaction.targetUser.toString(),
								})),
						],
						ephemeral: true,
					});
					await prompt(category.id);
				})
				.catch(async error => {
					client.log.error(error);
					await interaction.reply({
						components: [],
						embeds: [
							new ExtendedEmbedBuilder({
								iconURL: interaction.guild.iconURL(),
								text: settings.footer,
							})
								.setColor(settings.errorColour)
								.setTitle(getMessage('misc.expired.title'))
								.setDescription(getMessage('misc.expired.description')),
						],
					});
				});
		}
	}
};
