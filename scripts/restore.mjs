import { config } from 'dotenv';
import { program } from 'commander';
import fse from 'fs-extra';
import { join } from 'path';
import ora from 'ora';
import { PrismaClient } from '@prisma/client';

config();

program
	.requiredOption('-f, --file <path>', 'the path of the dump to import')
	.requiredOption('-y, --yes', 'yes, DELETE EVERYTHING in the database');

program.parse();

const options = program.opts();

let spinner = ora('Connecting').start();

const prisma_options = {};

if (process.env.DB_PROVIDER === 'sqlite' && !process.env.DB_CONNECTION_URL) {
	prisma_options.datasources = { db: { url: 'file:' + join(process.cwd(), './user/database.db') } };
}

const prisma = new PrismaClient(prisma_options);

if (process.env.DB_PROVIDER === 'sqlite') {
	const { default: sqliteMiddleware } = await import('../src/lib/middleware/prisma-sqlite.js');
	prisma.$use(sqliteMiddleware);
	await prisma.$queryRaw`PRAGMA journal_mode=WAL;`;
	await prisma.$queryRaw`PRAGMA synchronous=normal;`;
}

spinner.succeed('Connected');

spinner = ora(`Reading ${options.file}`).start();
const dump = JSON.parse(await fse.promises.readFile(options.file, 'utf8'));
spinner.succeed(`Parsed ${options.file}`);

// ! this order is important
const queries = [
	prisma.guild.deleteMany(),
	prisma.user.deleteMany(),
];

for (const [model, data] of dump) queries.push(prisma[model].createMany({ data }));
spinner = ora('Importing').start();
const [,, ...results] = await prisma.$transaction(queries);
for (const idx in results) spinner.succeed(`Imported ${results[idx].count} into ${dump[idx][0]}`);
process.exit(0);
