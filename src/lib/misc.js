const { createHash } = require('crypto');
module.exports.md5 = str => createHash('md5').update(str).digest('hex');
module.exports.msToMins = ms => Number((ms / 1000 / 60).toFixed(2));
