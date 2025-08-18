const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType,
	PermissionsBitField,
	MessageFlags,
} = require('discord.js');
const { isStaff } = require('../../lib/users');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { pools } = require('../../lib/threads');

const { crypto } = pools;

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

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
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
		let base_filter;

		if (member.id === interaction.member.id) {
			base_filter = {
				createdById: member.id,
				guildId: interaction.guild.id,
			};
		} else {
			const { categories } = await client.prisma.guild.findUnique({
				select: {
					categories: {
						select: {
							id: true,
							staffRoles: true,
						},
					},
				},
				where: { id: interaction.guild.id },
			});
			const allow_category_ids = (
				(
					client.supers.includes(interaction.member.id) ||
					interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
				)
					? categories
					: categories.filter(c => c.staffRoles.some(id => interaction.member.roles.cache.has(id)))
			)
				.map(c => c.id);
			base_filter = {
				categoryId: { in: allow_category_ids },
				createdById: member.id,
				guildId: interaction.guild.id,
			};
		}

		const open = await client.prisma.ticket.findMany({
			include: { category: true },
			where: {
				...base_filter,
				open: true,
			},
		});

		const closed = await client.prisma.ticket.findMany({
			include: { category: true },
			orderBy: { createdAt: 'desc' },
			take: 10, // max 10 rows
			where: {
				...base_filter,
				open: false,
			},
		});

		const getTopic = async ticket => (await crypto.queue(w => w.decrypt(ticket.topic))).replace(/\n/g, ' ').substring(0, 30);

		if (open.length >= 1) {
			fields.push({
				name: getMessage('commands.slash.tickets.response.fields.open.name'),
				value: (await Promise.all(
					open.map(async ticket => {
						const topic = ticket.topic ? `- \`${await getTopic(ticket)}\`` : '';
						return `> <#${ticket.id}> ${topic}`;
					}),
				)).join('\n'),
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
				value: (await Promise.all(
					closed.map(async ticket => {
						const topic = ticket.topic ? `- \`${await getTopic(ticket)}\`` : '';
						return `> ${ticket.category.name} #${ticket.number} (\`${ticket.id}\`) ${topic}`;
					}),
				)).join('\n'),
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
