module.exports = {
	sqlite: {
		name: 'SQLite',
		dialect: 'sqlite',
		packages: ['sqlite3'],
	},
	mysql: {
		name: 'MySQL',
		dialect: 'mysql',
		packages: ['mysql2']
	},
	maria: {
		name: 'MariaDB',
		dialect: 'mariadb',
		package: ['mariadb']
	},
	mariadb: {
		name: 'MariaDB',
		dialect: 'mariadb',
		package: ['mariadb']
	},
	postgre: { // this is wrong
		name: 'PostgreSQL',
		dialect: 'postgres',
		packages: ['pg', 'pg-hstore']
	},
	postgres: {
		name: 'PostgreSQL',
		dialect: 'postgres',
		packages: ['pg', 'pg-hstore']
	},
	postgresql: {
		name: 'PostgreSQL',
		dialect: 'postgres',
		packages: ['pg', 'pg-hstore']
	},
	microsoft: {
		name: 'Microsoft SQL',
		dialect: 'mssql',
		packages: ['tedious']
	},
};