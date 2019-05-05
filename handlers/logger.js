const leeks = require('leeks.js');
const now = new Date();
const d = now.getDate();
const h = now.getHours();
const m = now.getMinutes();
const s = now.getSeconds();
let timestamp = `${h}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;

exports.init = x => {
  console.log(`INIT FUNCTION TRIGGERED`)
};

exports.basic = (m) => {
  console.log(m)
};

exports.console = (m) => {
  console.log(`[INFO | ${timestamp}] ${m}`);
};

exports.info = (m) => {
  console.info(leeks.colours.cyan(`[INFO | ${timestamp}] ${m}`));
};
exports.success = (m) => {
  console.info(leeks.colours.green(`[INFO | ${timestamp}] ${m}`));
};
exports.debug = (m) => {
  console.info(leeks.colours.blueBright(`[DEBUG | ${timestamp}] ${m}`));
};
exports.warn = (m) => {
  console.warn(leeks.colours.yellowBright(`[WARN | ${timestamp}] ${m}`));
};
exports.error = (m) => {
  console.error(leeks.colours.red(`[ERROR | ${timestamp}] ${m}`));
};
