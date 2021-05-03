const { Sequelize } = require('sequelize');
const fs = require('fs');
const { path } = require('../utils/fs');
const types = require('./dialects');

module.exports = async (client) => {

	const {
		DB_TYPE,
		DB_HOST,
		DB_PORT,
		DB_USER,
		DB_PASS,
		DB_NAME
	} = process.env;

	let type = (DB_TYPE || 'sqlite').toLowerCase();

	const supported = Object.keys(types);
	if (!supported.includes(type)) {
		client.log.error(new Error(`DB_TYPE (${type}) is not a valid type`));
		return process.exit();
	}

	try {
		types[type].packages.forEach(pkg => require(pkg));
	} catch {
		let required = types[type].packages.map(i => `"${i}"`).join(' and ');
		client.log.error(new Error(`Please install the package(s) for your selected database type: ${required}`));
		return process.exit();
	}

	let sequelize;

	if (type === 'sqlite') {
		client.log.info('Using SQLite storage');
		sequelize = new Sequelize({
			dialect: types[type].dialect,
			storage: path('./user/database.sqlite'),
			logging: text => client.log.debug(text)
		});
		client.log.warn('SQLite is not sufficient for a production environment if you want to use ticket archives. You should disable "log_messages" in your servers\' settings or use a different database.');
	} else {
		client.log.info(`Connecting to ${types[type].name} database...`);
		sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
			dialect: types[type].dialect,
			host: DB_HOST,
			port: DB_PORT,
			logging: text => client.log.debug(text)
		});
	}

	try {
		await sequelize.authenticate();
		client.log.success('Connected to database successfully');
	} catch (error) {
		client.log.warn('Failed to connect to database');
		client.log.error(error);
		return process.exit();
	}

	const models = fs.readdirSync(path('./src/database/models'))
		.filter(filename => filename.endsWith('.model.js'));

	for (const model of models) {
		require(`./models/${model}`)(client, sequelize);
	}

	sequelize.sync({
		alter: {
			drop: false
		}
	});

	return sequelize;
};