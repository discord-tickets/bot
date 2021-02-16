const { Structures } = require('discord.js');

Structures.extend('TextChannel', TextChannel => {
	return class extends TextChannel {
		constructor(client, data) {
			super(client, data);
		}
		
		get isTicket() {
			return !!this.client.db.Ticket.findOne({
				where: {
					id: this.id
				}
			});
		}

		get ticket() {
			return new class {
				constructor(channel) {
					this.channel = channel;
				}
			}(this);
		}
	};
});