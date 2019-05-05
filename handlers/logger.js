const fs = require('fs');
const leeks = require('leeks.js'); // ultra light weight alternative to chalk
const now = new Date();
let date = now.getDate();

function time() {
  const n = new Date();
  const h = n.getHours();
  const m = n.getMinutes();
  const s = n.getSeconds();
  return `${h}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
}
let d = ('0' + date).slice(-2);

const files = fs.readdirSync('./logs/').filter(file => file.endsWith('.log'));
let path = `./logs/${d}-${time().replace(':', '-').replace(':', '-')}.log`;
// const log = require(path);


function init(x) {
  console.log(leeks.colours.cyan(`[INFO | ${time()}] Setting up...`));
  console.log(`[INFO | ${time()}] Initialising logger`);
  console.log(`[INFO | ${time()}] Cleaning up...`);
  for (const file of files) {
    if(!file.startsWith(`${d}-`)) {
      fs.unlinkSync(`./logs/${file}`)
      console.log(`[INFO | ${time()}] Deleting ./logs/${file}`);
    };
  };
  try {
    fs.appendFileSync(path, `Discord Tickets by Eartharoid | Log File (${d}/${('0' + now.getMonth()).slice(-2)}/${now.getFullYear()}) -->\n`, function (error) {
      if (error) throw error;
    });
    console.log(`[INFO | ${time()}] Creating new log file (${path})`);
  } catch(error) {
    console.error(leeks.colours.red(error));
  }
};

exports.init = x => {
   init(x)
};

exports.basic = (m) => {
  console.log(`[${time()}] ${m}`)
  fs.writeFileSync(path, `[${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};

exports.console = (m) => {
  console.log(`[INFO | ${time()}] ${m}`);
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};

exports.info = (m) => {
  console.info(leeks.colours.cyan(`[INFO | ${time()}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.success = (m) => {
  console.info(leeks.colours.green(`[INFO | ${time()}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.debug = (m) => {
  console.info(leeks.colours.blueBright(`[DEBUG | ${time()}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[DEBUG | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.warn = (m) => {
  console.warn(leeks.colours.yellowBright(`[WARN | ${time()}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[WARN | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.error = (m) => {
  console.error(leeks.colours.red(`[ERROR | ${time()}] ${m}`));
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[ERROR | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
