const { createHash } = require('crypto');
module.exports.md5 = str => createHash('md5').update(str).digest('hex');
module.exports.msToMins = ms => Number((ms / 1000 / 60).toFixed(2));
module.exports.iconURL = guildLike => guildLike.icon
	? guildLike.client.rest.cdn.icon(guildLike.id, guildLike.icon)
	: `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(guildLike.name)}&size=96&backgroundType=gradientLinear&fontWeight=600`;
