module.exports = {
	maria: {
		dialect: 'mariadb',
		name: 'MariaDB',
		package: ['mariadb']
	},
	mariadb: {
		dialect: 'mariadb',
		name: 'MariaDB',
		package: ['mariadb']
	},
	microsoft: {
		dialect: 'mssql',
		name: 'Microsoft SQL',
		packages: ['tedious']
	},
	mysql: {
		dialect: 'mysql',
		name: 'MySQL',
		packages: ['mysql2']
	},
	postgre: { // this is wrong
		dialect: 'postgres',
		name: 'PostgreSQL',
		packages: ['pg', 'pg-hstore']
	},
	postgres: {
		dialect: 'postgres',
		name: 'PostgreSQL',
		packages: ['pg', 'pg-hstore']
	},
	postgresql: {
		dialect: 'postgres',
		name: 'PostgreSQL',
		packages: ['pg', 'pg-hstore']
	},
	sqlite: {
		dialect: 'sqlite',
		name: 'SQLite',
		packages: ['sqlite3']
	}
};