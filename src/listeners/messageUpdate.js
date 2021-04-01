module.exports = {
	event: 'messageUpdate',
	execute: async (client, oldm, newm) => {

		if (newm.partial) {
			try {
				await newm.fetch();
			} catch (err) {
				return client.log.error(err);
			}
		}

		let settings = await newm.guild?.settings;

		if (settings?.log_messages) {
			if (newm.system) return;

			let m_row = await client.db.models.Message.findOne({
				where: {
					id: newm.id
				}
			});

			if (m_row) {	
				let embeds = [];
				for (let embed in newm.embeds) embeds.push({ ...newm.embeds[embed] });

				m_row.data = {
					content: newm.content,
					// time: newm.editedTimestamp,
					embeds: newm.embeds.map(embed => {
						return { ...newm.embeds[embed] };
					}),
					attachments: [...newm.attachments.values()]
				};

				if (newm.editedTimestamp) m_row.edited = true;

				await m_row.save(); // save changes
			}
		}
	}
};