module.exports = {
	event: 'msgUpdate',
	execute: async (client, oldm, newm) => {

		if (newm.partial)
			try {
				await newm.fetch();
			} catch (err) {
				return client.log.error(err);
			}

		let settings = await newm.guild?.settings;

		if (settings?.messages) {
			if (newm.system) return;

			let msg = await client.db.models.msg.findOne({
				where: {
					id: newm.channel.id
				}
			});

			if (msg) {	
				let embeds = msg.embeds.map(embed => {
					return { ...msg.embeds[embed] };
				});
				
				if (msg.editedTimestamp) { // message has been edited
					msg.updates.unshift({
						content: msg.content,
						time: msg.editedTimestamp,
						embeds,
						attachments: [ ...msg.attachments.values() ]
					});
					msg.edited = true;
				}
				else { // probably just a link embed loading
					msg.updates[0] = Object.assign(msg.updates[0], embeds);
				}

				await msg.save(); // save changes to msg row
			}
		}
	}
};