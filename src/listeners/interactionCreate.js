const EventListener = require('../modules/listeners/listener');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require('sequelize');

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'interactionCreate' });
	}

	async execute(interaction) {
        if (!interaction.isButton() || !interaction.inGuild()) return;

        const guild = interaction.message.guild;
        const settings = await this.client.utils.getSettings(interaction.guild);
        const i18n = this.client.i18n.getLocale(settings.locale);
        const channel = interaction.message.channel;
        const member = await guild.members.fetch(interaction.user.id);

        //RECLAIM TICKET
        if(interaction.customId == "dst_claimed" && await this.client.utils.isStaff(member)){
            const t_row = await this.client.db.models.Ticket.findOne({ where: { id: channel.id } });
            await t_row.update({ claimed_by: member.user.id });
            await channel.permissionOverwrites.edit(member.user.id, { VIEW_CHANNEL: true }, `Ticket claimed by ${member.user.tag}`);

            const cat_row = await this.client.db.models.Category.findOne({ where: { id: t_row.category } });
            for (const role of cat_row.roles) {
                await channel.permissionOverwrites.edit(role, { VIEW_CHANNEL: false }, `Ticket claimed by ${member.user.tag}`);
            }

            this.client.log.info(`${member.user.tag} has claimed "${channel.name}" in "${guild.name}"`);
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(settings.colour)
                        .setAuthor(member.user.username, member.user.displayAvatarURL())
                        .setTitle(i18n('ticket.claimed.title'))
                        .setDescription(i18n('ticket.claimed.description', member.toString()))
                        .setFooter(settings.footer, guild.iconURL())
                ]
            });

            await channel.setName(`${member.user.username}-${channel.name}`).catch(console.error);
        }

        //CLOSE TICKET ?
        if(interaction.customId == "dst_close"){
            this.client.log.info(`${member.user.tag} has close? "${channel.name}" in "${guild.name}"`);
            const row = new MessageActionRow();

            const button = new MessageButton()
                .setLabel("Cerrar")
                //.setEmoji("✅")
                .setStyle("DANGER")
                .setCustomId(`dst_close_yes`);

			row.addComponents(button);

            const button2 = new MessageButton()
                .setLabel("Cancelar")
                //.setEmoji("⛔")
			    .setStyle("SECONDARY")
			    .setCustomId(`dst_close_not`);

			row.addComponents(button2);

            await interaction.reply({
                content: "¿Estás seguro de cerrar este ticket?",
                components: [row]
            });
        }

        //CLOSE TICKET YES
        if(interaction.customId == "dst_close_yes"){
            this.client.log.info(`${member.user.tag} has close yes "${channel.name}" in "${guild.name}"`);

            //PROCESS CLOSE TICKET: Save transcript and delete ticket. (close.js)
            let t_row = await this.client.db.models.Ticket.findOne({ where: { id: channel.id } });
            await this.client.tickets.close(t_row.id, member.user.id, guild.id, "");
        }

        //CLOSE TICKET NOT
        if(interaction.customId == "dst_close_not"){
            this.client.log.info(`${member.user.tag} has close not "${channel.name}" in "${guild.name}"`);
            interaction.message.delete()
        }

        //OPEN TICKET
        if(!interaction.customId.includes("tickets-")) return;

        const args = interaction.customId.split("-");
        //this.client.log.info(`${interaction.customId} id del botón. Mensaje: ${interaction.message.id} - ${args[1]}`);
        const p_row = await this.client.db.models.Panel.findOne({ where: { message: interaction.message.id } });
        if (p_row && typeof p_row.categories !== 'string') {
            const { user } = interaction;

            const category_id = p_row.categories[args[1]];
            if (!category_id) return;

            const cat_row = await this.client.db.models.Category.findOne({ where: { id: category_id } });
            const tickets = await this.client.db.models.Ticket.findAndCountAll({
                where: {
                    category: cat_row.id,
                    creator: user.id,
                    open: true
                }
            });

            let response;
            if (tickets.count >= cat_row.max_per_member) {
                if (cat_row.max_per_member === 1) {
                    const embed = new MessageEmbed()
                        .setColor(settings.error_colour)
                        .setAuthor(user.username, user.displayAvatarURL())
                        .setTitle(i18n('commands.new.response.has_a_ticket.title'))
                        .setDescription(i18n('commands.new.response.has_a_ticket.description', tickets.rows[0].id))
                        .setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), guild.iconURL());
                    try {
                        response = await user.send({ embeds: [embed] });
                    } catch {
                        response = await channel.send({ embeds: [embed] });
                    }
                } else {
                    const list = tickets.rows.map(row => {
                        if (row.topic) {
                            const description = row.topic.substring(0, 30);
                            const ellipses = row.topic.length > 30 ? '...' : '';
                            return `<#${row.id}>: \`${description}${ellipses}\``;
                        } else {
                            return `<#${row.id}>`;
                        }
                    });
                    const embed = new MessageEmbed()
                        .setColor(settings.error_colour)
                        .setAuthor(user.username, user.displayAvatarURL())
                        .setTitle(i18n('commands.new.response.max_tickets.title', tickets.count))
                        .setDescription(i18n('commands.new.response.max_tickets.description', settings.command_prefix, list.join('\n')))
                        .setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), user.iconURL());
                    try {
                        response = await user.send({ embeds: [embed] });
                    } catch {
                        response = await channel.send({ embeds: [embed] });
                    }
                }
            } else {
                try {
                    await this.client.tickets.create(guild.id, user.id, cat_row.id);

                    const tickets2 = await this.client.db.models.Ticket.findAndCountAll({
                        where: {
                            category: cat_row.id,
                            creator: user.id,
                            open: true
                        }
                    });

                    await interaction.reply({ content: `Ticket Creado! <:check2:880631366012768286> Entra aquí para empezar a conversar: <#${tickets2.rows[0].id}>`, ephemeral: true });
                } catch (error) {
                    const embed = new MessageEmbed()
                        .setColor(settings.error_colour)
                        .setAuthor(user.username, user.displayAvatarURL())
                        .setTitle(i18n('commands.new.response.error.title'))
                        .setDescription(error.message)
                        .setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), guild.iconURL());
                    try {
                        response = await user.send({ embeds: [embed] });
                    } catch {
                        response = await channel.send({ embeds: [embed] });
                    }
                }
            }
            if (response) {
                setTimeout(async () => {
                    await response.delete();
                }, 15000);
            }
        }
		//this.client.commands.handle(message); // pass the message to the command handler
	}
}