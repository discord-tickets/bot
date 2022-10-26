const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const { isStaff } = require('../../lib/users');
const ExtendedEmbedBuilder = require('../../lib/embed');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

module.exports = class TicketsSlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.tickets.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.tickets.name')));

		let opts = [
			{
				name: 'member',
				required: false,
				type: ApplicationCommandOptionType.User,
			},
		];
		opts = opts.map(o => {
			const descriptionLocalizations = {};
			client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, `commands.slash.tickets.options.${o.name}.description`)));

			const nameLocalizations = {};
			client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.tickets.options.${o.name}.name`)));

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

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ ephemeral: true });
		await client.application.commands.fetch();

		const member = interaction.options.getMember('member', false) ?? interaction.member;
		const ownOrOther = member.id === interaction.member.id ? 'own' : 'other';
		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
		const getMessage = client.i18n.getLocale(settings.locale);

		if (member.id !== interaction.member.id && !(await isStaff(interaction.guild, interaction.member.id))) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.errorColour)
						.setTitle(getMessage('commands.slash.tickets.not_staff.title'))
						.setDescription(getMessage('commands.slash.tickets.not_staff.description')),
				],
			});
		}

		const fields = [];

		const open = await client.prisma.ticket.findMany({
			include: { category: true },
			where: {
				createdById: member.id,
				guildId: interaction.guild.id,
				open: true,
			},
		});

		const closed = await client.prisma.ticket.findMany({
			include: { category: true },
			orderBy: { createdAt: 'desc' },
			where: {
				createdById: member.id,
				guildId: interaction.guild.id,
				open: false,
			},
		});

		if (open.length >= 1) {
			fields.push({
				name: getMessage('commands.slash.tickets.response.fields.open.name'),
				value: open.map(ticket =>{
					const topic = ticket.topic ? `- \`${decrypt(ticket.topic).replace(/\n/g, ' ').slice(0, 30) }\`` : '';
					return `> <#${ticket.id}> ${topic}`;
				}).join('\n'),
			});
		}

		if (closed.length === 0) {
			const newCommand = client.application.commands.cache.find(c => c.name === 'new');
			fields.push({
				name: getMessage('commands.slash.tickets.response.fields.closed.name'),
				value: getMessage(`commands.slash.tickets.response.fields.closed.none.${ownOrOther}`, {
					new: `</${newCommand.name}:${newCommand.id}>`,
					user: member.user.toString(),
				}),
			});
		} else {
			fields.push({
				name: getMessage('commands.slash.tickets.response.fields.closed.name'),
				value: closed.slice(0, 10).map(ticket => { // max 10 rows
					const topic = ticket.topic ? `- \`${decrypt(ticket.topic).replace(/\n/g, ' ').slice(0, 30)}\`` : '';
					return `> ${ticket.category.name} #${ticket.number} ${topic}`;
				}).join('\n'),
			});
		}

		const embed = new ExtendedEmbedBuilder({
			iconURL: interaction.guild.iconURL(),
			text: settings.footer,
		})
			.setColor(settings.primaryColour)
			.setAuthor({
				iconURL: member.displayAvatarURL(),
				name: member.displayName,
			})
			.setTitle(getMessage(`commands.slash.tickets.response.title.${ownOrOther}`, { displayName: member.displayName }))
			.setFields(fields);

		if (settings.archive && !client.config.overrides.disableArchives) {
			const transcriptCommand = client.application.commands.cache.find(c => c.name === 'transcript');
			embed.setDescription(getMessage('commands.slash.tickets.response.description', { transcript: `</${transcriptCommand.name}:${transcriptCommand.id}>` }));
		}

		return await interaction.editReply({ embeds: [embed] });
	}
};