import { config } from 'dotenv';
import { program } from 'commander';
import fse from 'fs-extra';
import { join } from 'path';
import ora from 'ora';
import { PrismaClient } from '@prisma/client';

config();

program
	.requiredOption('-g, --guild <id>', 'the ID of the guild to export');

program.parse();

const options = program.opts();

fse.ensureDirSync(join(process.cwd(), './user/dumps'));

const spinner = ora('Connecting').start();

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


const dump = {};

spinner.text = 'Exporting settings';
dump.settings = await prisma.guild.findFirst({ where: { id: options.guild } });
spinner.succeed('Exported settings');

spinner.text = 'Exporting categories';
dump.categories = await prisma.category.findMany({
	include: { questions: true },
	where: { guildId: options.guild },
});
spinner.succeed(`Exported ${dump.categories.length} categories`);

spinner.text = 'Exporting tags';
dump.tags = await prisma.tag.findMany({ where: { guildId: options.guild } });
spinner.succeed(`Exported ${dump.tags.length} tags`);

spinner.text = 'Exporting tickets';
dump.tickets = await prisma.ticket.findMany({
	include: {
		archivedChannels: true,
		archivedMessages: true,
		archivedRoles: true,
		archivedUsers: true,
		feedback: true,
		questionAnswers: true,
	},
	where: { guildId: options.guild },
});
spinner.succeed(`Exported ${dump.tickets.length} tickets`);

spinner.text = 'Exporting users';
dump.users = await prisma.user.findMany({
	where: {
		ticketsClaimed: { some: { guildId: options.guild } },
		ticketsClosed: { some: { guildId: options.guild } },
		ticketsCreated: { some: { guildId: options.guild } },
	},
});
spinner.succeed(`Exported ${dump.users.length} users`);

const file_path = join(process.cwd(), './user/dumps', `${options.guild}.json`);

spinner.text = `Writing to "${file_path}"`;

// async to not freeze the spinner
await fse.promises.writeFile(file_path, JSON.stringify(dump));

spinner.succeed(`Written to "${file_path}"`);
