import { config } from 'dotenv';
import { program } from 'commander';
import { join } from 'path';
import ora from 'ora';
import { PrismaClient } from '@prisma/client';

config();

program
	.requiredOption('-y, --yes', 'ARE YOU SURE?')
	.option('-d, --days <number>', 'number of days', 365);

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

const now = Date.now();
const elapsed = 1000 * 60 * 60 * 24 * options.days;
const cutoff = now - elapsed;

spinner = ora('Counting total guilds').start();
const total = await prisma.guild.count();
spinner.succeed(`Found ${total} total guilds`);

// ! the bot might still be in these guilds
spinner = ora(`Deleting guilds inactive for more than ${options.days} days`).start();
const result = await prisma.guild.deleteMany({ where: { tickets: { none: { createdAt: { gt: new Date(cutoff) } } } } });
spinner.succeed(`Deleted ${result.count} guilds; ${total - result.count} remaining`);

process.exit(0);
