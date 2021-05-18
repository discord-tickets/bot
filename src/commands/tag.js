const Command = require('../modules/commands/command');
// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Message } = require('discord.js');
const { parseArgsStringToArgv: argv } = require('string-argv');
const parseArgs = require('command-line-args');

module.exports = class TagCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.tag.name'),
			description: i18n('commands.tag.description'),
			aliases: [
				i18n('commands.tag.aliases.faq'),
				i18n('commands.tag.aliases.t'),
				i18n('commands.tag.aliases.tags'),
			],
			process_args: false,
			args: [
				{
					name: i18n('commands.tag.args.tag.name'),
					description: i18n('commands.tag.args.command.description'),
					example: i18n('commands.tag.args.tag.example'),
					required: false,
				}
			],
			staff_only: true
		});
	}

	/**
	 * @param {Message} message 
	 * @param {string} args 
	 * @returns {Promise<void|any>}
	 */
	async execute(message, args) {
		const settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		const t_row = await this.client.db.models.Ticket.findOne({
			where: {
				id: message.channel.id
			}
		});

		args = args.split(/\s/g); // convert to an array
		const tag_name = args.shift(); // shift the first element
		args = args.join(' '); // convert back to a string with the first word removed

		if (tag_name && settings.tags[tag_name]) {
			const tag = settings.tags[tag_name];
			const placeholders = [...tag.matchAll(/(?<!\\){{1,2}\s?([A-Za-z0-9._:]+)\s?(?<!\\)}{1,2}/gi)].map(p => p[1]);
			const requires_ticket = placeholders.some(p => p.startsWith('ticket.'));

			if (requires_ticket && !t_row) {
				return await message.channel.send(
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.tag.response.not_a_ticket.title'))
						.setDescription(i18n('commands.tag.response.not_a_ticket.description'))
						.setFooter(settings.footer, message.guild.iconURL())
				);
			}

			let expected = placeholders
				.filter(p => p.startsWith(':'))
				.map(p => {
					return {
						name: p.substr(1, p.length),
						type: String,
					};
				});

			if (expected.length >= 1) {
				try {
					args = parseArgs(expected, { argv: argv(args) });
				} catch (error) {
					return await message.channel.send(
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.tag.response.error'))
							.setDescription(`\`\`\`${error.message}\`\`\``)
							.setFooter(settings.footer, message.guild.iconURL())
					);
				}
			} else {
				args = {};
			}

			for (const p of expected) {
				if (!args[p.name]) {
					const list = expected.map(p => `\`${p.name}\``);
					return await message.channel.send(
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.tag.response.error'))
							.setDescription(i18n('commands.tag.response.missing', list.join(', ')))
							.setFooter(settings.footer, message.guild.iconURL())
					);
				}
			}

			if (requires_ticket) {
				args.ticket = t_row.toJSON();
				args.ticket.topic = t_row.topic ? this.client.cryptr.decrypt(t_row.topic) : null;
			}

			const text = tag.replace(/(?<!\\){{1,2}\s?:?([A-Za-z0-9._]+)\s?(?<!\\)}{1,2}/gi, ($, $1) => this.client.i18n.resolve(args, $1));
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setDescription(text)
			);
		} else {
			const list = Object.keys(settings.tags).map(t => `❯ **\`${t}\`**`);
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.tag.response.list.title'))
					.setDescription(list.join('\n'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

	}
};