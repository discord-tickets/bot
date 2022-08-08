const { EmbedBuilder } = require('discord.js');

module.exports = class ExtendedEmbedBuilder extends EmbedBuilder {
	constructor(footer, opts) {
		super(opts);
		if (footer && footer.text) this.setFooter(footer);
	}
};