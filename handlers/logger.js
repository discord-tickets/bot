const fs = require('fs');
const leeks = require('leeks.js'); // ultra light weight alternative to chalk
const now = new Date();
let date = now.getDate();
const h = now.getHours();
const m = now.getMinutes();
const s = now.getSeconds();
let timestamp = `${h}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
let d = ('0' + date).slice(-2);

const files = fs.readdirSync('./logs/').filter(file => file.endsWith('.log'));
let path = `./logs/${d}-${timestamp.replace(':', '-').replace(':', '-')}.log`;
// const log = require(path);

function init(x) {
  console.log(leeks.colours.cyan(`[INFO | ${timestamp}] Setting up...`));
  console.log(`[INFO | ${timestamp}] Initialising logger`);
  console.log(`[INFO | ${timestamp}] Cleaning up...`);
  for (const file of files) {
    if(!file.startsWith(`${d}-`)) {
      fs.unlinkSync(`./logs/${file}`)
      console.log(`[INFO | ${timestamp}] Deleting ./logs/${file}`);
    };
  };
  try {
    fs.appendFileSync(path, `Discord Tickets | Log File (${timestamp})\n`, function (error) {
      if (error) throw error;
    });
    console.log(`[INFO | ${timestamp}] Creating new log file (${path})`);
  } catch(error) {
    console.error(leeks.colours.red(error));
  }
};

exports.init = x => {
   init(x)
};

exports.basic = (m) => {
  console.log(`[${timestamp}] ${m}`)
  fs.writeFileSync(path, `[${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};

exports.console = (m) => {
  console.log(`[INFO | ${timestamp}] ${m}`);
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};

exports.info = (m) => {
  console.info(leeks.colours.cyan(`[INFO | ${timestamp}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.success = (m) => {
  console.info(leeks.colours.green(`[INFO | ${timestamp}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.debug = (m) => {
  console.info(leeks.colours.blueBright(`[DEBUG | ${timestamp}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[DEBUG | ${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.warn = (m) => {
  console.warn(leeks.colours.yellowBright(`[WARN | ${timestamp}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[WARN | ${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.error = (m) => {
  console.error(leeks.colours.red(`[ERROR | ${timestamp}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[ERROR | ${timestamp}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
