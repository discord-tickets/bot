const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const { isStaff } = require('../../lib/users');
const ExtendedEmbedBuilder = require('../../lib/embed');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

module.exports = class TicketsSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'tickets';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
			options: [
				{
					name: 'member',
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
			take: 10, // max 10 rows
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
				value: closed.map(ticket => {
					const topic = ticket.topic ? `- \`${decrypt(ticket.topic).replace(/\n/g, ' ').slice(0, 30)}\`` : '';
					return `> ${ticket.category.name} #${ticket.number} (\`${ticket.id}\`) ${topic}`;
				}).join('\n'),
			});
		}
		// TODO: add portal URL to view all (this list is limited to the last 10)

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

		if (settings.archive && process.env.OVERRIDE_ARCHIVE !== 'false') {
			const transcriptCommand = client.application.commands.cache.find(c => c.name === 'transcript');
			embed.setDescription(getMessage('commands.slash.tickets.response.description', { transcript: `</${transcriptCommand.name}:${transcriptCommand.id}>` }));
		}

		return await interaction.editReply({ embeds: [embed] });
	}
};
