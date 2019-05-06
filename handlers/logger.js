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
if (!fs.existsSync('./logs')) {
  fs.mkdirSync(`./logs`);
  console.log(`[INFO | ${time()}] No logs directory found, creating one for you.`);
}
const files = fs.readdirSync('./logs/').filter(file => file.endsWith('.log'));
// let path = `./logs/${d}-${time().replace(':', '-').replace(':', '-')}.log`;
let path = `./logs/${d}-${('0' + now.getMonth()).slice(-2)}-${now.getFullYear()}.${time().replace(':', '-').replace(':', '-')}.log`;
// const log = require(path);


function init(x) {
  // console.log(leeks.colours.cyan(`[INFO | ${time()}] Setting up...`));
  console.log(`[INFO | ${time()}] Initialising logger`);

  console.log(`[INFO | ${time()}] Cleaning up...`);
  for (const file of files) {
    // if(!file.startsWith(`${d}-`)) {
    if(parseInt(file.substr(0,2)) < parseInt(d-7) || parseInt(file.substr(0,2)) > parseInt(d)) {
      fs.unlinkSync(`./logs/${file}`)
      console.log(`[INFO | ${time()}] Deleting './logs/${file}'`);
    };
  };
  try {
    if(x){
      fs.appendFileSync(path, `${x} | Log File (${d}/${('0' + now.getMonth()).slice(-2)}/${now.getFullYear()}) -->\n`, function (error) {
        if (error) throw error;
      });
    } else {
      fs.appendFileSync(path, `Log File (${d}/${('0' + now.getMonth()).slice(-2)}/${now.getFullYear()}) -->\n`, function (error) {
        if (error) throw error;
      });
    }

    console.log(`[INFO | ${time()}] Creating new log file (${path})`);
  } catch(error) {
    console.error(leeks.colours.red(error));
  }
};

exports.init = x => {
   init(x)
};

exports.basic = (m, c) => {
  if(c){console.log(leeks.colours[c](`[${time()}] ${m}`))} else {console.log(`[${time()}] ${m}`)};

  fs.writeFileSync(path, `[${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};

exports.console = (m, c) => {
  if(c){console.log(leeks.colours[c](`[${time()}] ${m}`))} else {console.log(`[INFO | ${time()}] ${m}`)};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};

exports.info = (m, c) => {
  if(c){console.info(leeks.colours[c](`[INFO | ${time()}] ${m}`))} else {console.info(leeks.colours.cyan(`[INFO | ${time()}] ${m}`))};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.success = (m, c) => {
  if(c){console.info(leeks.colours[c](`[INFO | ${time()}] ${m}`))} else {console.info(leeks.colours.green(`[INFO | ${time()}] ${m}`))};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[INFO | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.debug = (m, c) => {
  if(c){console.info(leeks.colours[c](`[DEBUG | ${time()}] ${m}`))} else {console.info(leeks.colours.blueBright(`[DEBUG | ${time()}] ${m}`))};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[DEBUG | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.warn = (m, c) => {
  if(c){console.warn(leeks.colours[c](`[WARN | ${time()}] ${m}`))} else {console.warn(leeks.colours.yellowBright(`[WARN | ${time()}] ${m}`))};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[WARN | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.error = (m, c) => {
  if(c){console.error(leeks.colours[c](`[ERROR | ${time()}] ${m}`))} else {console.error(leeks.colours.red(`[ERROR | ${time()}] ${m}`))};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[ERROR | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
exports.custom = (t, m, c) => {
  if(c){console.log(leeks.colours[c](`[${t} | ${time()}] ${m}`))} else {console.log(`[${t} | ${time()}] ${m}`)};
  let data = fs.readFileSync(path);
  fs.writeFileSync(path, data + `[${t} | ${time()}] ${m}\n`, function (error) {
    if (error) throw error;
  });
};
module.exports.colors  = leeks.colors;
module.exports.colours = leeks.colours;
module.exports.color  = leeks.colors;
module.exports.colour = leeks.colours;
