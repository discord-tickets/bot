const { isStaff } = require('./users');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const ExtendedEmbedBuilder = require('./embed');

module.exports = async function handleStaleTickets(client, staleInterval) {
	client.log.info.cron('Handling stale tickets');
	const closeCommand = client.application.commands.cache.find(c => c.name === 'close');
	const guilds = await client.prisma.guild.findMany({
		include: {
			tickets: {
				include: { category: true },
				where: { open: true },
			},
		},
		// where: { staleAfter: { not: null } },
		where: { staleAfter: { gte: staleInterval } },
	});
	let processed = 0;
	let closed = 0;
	let marked = 0;

	for (const guild of guilds) {
		const getMessage = client.i18n.getLocale(guild.locale);
		for (const ticket of guild.tickets) {
			try {
				processed++;
				if (client.tickets.$stale.has(ticket.id)) {
					const $ = client.tickets.$stale.get(ticket.id);
					const autoCloseAfter = $.closeAt - $.staleSince;
					const halfway = $.closeAt - (autoCloseAfter / 2);
					const channel = client.channels.cache.get(ticket.id);
					if (!channel) {
						client.tickets.$stale.delete(ticket.id);
						continue;
					}
					if (Date.now() >= halfway && Date.now() < halfway + staleInterval) {
						await channel.send({
							embeds: [
								new ExtendedEmbedBuilder()
									.setColor(guild.primaryColour)
									.setTitle(getMessage('ticket.closing_soon.title'))
									.setDescription(getMessage('ticket.closing_soon.description', { timestamp: Math.floor(($.closeAt + staleInterval) / 1000) })),
							],
						});
					} else if ($.closeAt < Date.now()) {
						await client.tickets.finallyClose(ticket.id, $);
						closed++;
					}
				} else if (Date.now() - (ticket.lastMessageAt || ticket.createdAt) >= guild.staleAfter) {
					// set as stale
					/** @type {import("discord.js").TextChannel} */
					const channel = await client.channels.fetch(ticket.id);
					if (!channel) {
						await client.tickets.finallyClose(ticket.id, { reason: 'channel deleted' });
						closed++;
						continue;
					}
					const messages = (await channel.messages.fetch({ limit: 5 })).filter(m => m.author.id !== client.user.id);
					let ping = '';

					if (messages.size > 0) {
						const lastMessage =  messages.first();
						const staff = await isStaff(channel.guild, lastMessage.author.id);
						if (staff) ping = `<@${ticket.createdById}>`;
						else ping = ticket.category.pingRoles.map(r => `<@&${r}>`).join(' ');
					}

					const sent = await channel.send({
						components: [
							new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId(JSON.stringify({ action: 'close' }))
										.setStyle(ButtonStyle.Danger)
										.setEmoji(getMessage('buttons.close.emoji'))
										.setLabel(getMessage('buttons.close.text')),
								),
						],
						content: ping,
						embeds: [
							new ExtendedEmbedBuilder({
								iconURL: channel.guild.iconURL(),
								text: guild.footer,
							})
								.setColor(guild.primaryColour)
								.setTitle(getMessage('ticket.inactive.title'))
								.setDescription(getMessage('ticket.inactive.description', {
									close: `</${closeCommand.name}:${closeCommand.id}>`,
									timestamp: Math.floor((ticket.lastMessageAt || ticket.createdAt).getTime() / 1000),
								})),
						],
					});

					client.tickets.$stale.set(ticket.id, {
						closeAt: guild.autoClose ? Date.now() + Number(guild.autoClose) : null,
						closedBy: null,
						message: sent,
						messages: 0,
						reason: 'inactivity',
						staleSince: Date.now(),
					});
					marked++;
				}
			} catch (error) {
				client.log.error(error);
			}
		}
	}
	client.log.success.cron({
		closed,
		marked,
		processed,
		stale: client.tickets.$stale.size,
	});
};