const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { logTicketEvent } = require('../../lib/logging');

module.exports = class PrioritySlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.priority.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.priority.name')));

		let opts = [
			{
				choices: ['HIGH', 'MEDIUM', 'LOW'],
				name: 'priority',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
		];
		opts = opts.map(o => {
			const descriptionLocalizations = {};
			client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, `commands.slash.priority.options.${o.name}.description`)));

			const nameLocalizations = {};
			client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.priority.options.${o.name}.name`)));

			if (o.choices) {
				o.choices = o.choices.map(c => {
					const nameLocalizations = {};
					client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.priority.options.${o.name}.choices.${c}`)));
					return {
						name: nameLocalizations['en-GB'],
						nameLocalizations: nameLocalizations,
						value: c,
					};
				});
			}

			return {
				...o,
				description: descriptionLocalizations['en-GB'],
				descriptionLocalizations,
				nameLocalizations: nameLocalizations,
			};
		});

		super(client, {
			...options,
			description: descriptionLocalizations['en-GB'],
			descriptionLocalizations,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
			options: opts,
		});
	}

	getEmoji(priority) {
		let emoji;
		switch (priority) {
		case 'HIGH': {
			emoji = '🔴';
			break;
		}
		case 'MEDIUM': {
			emoji = '🟠';
			break;
		}
		case 'LOW': {
			emoji = '🟢';
			break;
		}
		}
		return emoji;
	}

	/**
	 *
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply();

		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
		const getMessage = client.i18n.getLocale(settings.locale);
		const ticket = await client.prisma.ticket.findUnique({
			include: { category: { select: { channelName: true } } },
			where: { id: interaction.channel.id },
		});

		if (!ticket) {
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

		const priority = interaction.options.getString('priority', true);
		let name = interaction.channel.name;
		if (ticket.priority) name = name.replace(this.getEmoji(ticket.priority), this.getEmoji(priority));
		else name = this.getEmoji(priority) + name;
		await interaction.channel.setName(name);

		// don't reassign ticket because the original is used below
		await client.prisma.ticket.update({
			data: { priority },
			where: { id: interaction.channel.id },
		});

		logTicketEvent(this.client, {
			action: 'update',
			diff: {
				original: { priority: ticket.priority },
				updated: { priority: priority },
			},
			target: {
				id: ticket.id,
				name: `<#${ticket.id}>`,
			},
			userId: interaction.user.id,
		});

		return await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: interaction.guild.iconURL(),
					text: settings.footer,
				})
					.setColor(settings.successColour)
					.setTitle(getMessage('commands.slash.priority.success.title'))
					.setDescription(getMessage('commands.slash.priority.success.description', { priority: getMessage(`commands.slash.priority.options.priority.choices.${priority}`) })),
			],
		});

	}
};