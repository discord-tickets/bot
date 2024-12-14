import { config } from 'dotenv';
import { program } from 'commander';
import fse from 'fs-extra';
import { join } from 'path';
import ora from 'ora';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import Cryptr from 'cryptr';

config();

program
	.requiredOption('-g, --guild <id>', 'the ID of the guild to export');

program.parse();

const options = program.opts();

const hash = createHash('sha256').update(options.guild).digest('hex');
const file_cryptr = new Cryptr(hash);
const db_cryptr = new Cryptr(process.env.ENCRYPTION_KEY);


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

// TODO: decrypt

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
dump.tickets = dump.tickets.map(ticket => {
	if (ticket.topic) ticket.topic = db_cryptr.decrypt(ticket.topic);

	ticket.archivedChannels = ticket.archivedChannels.map(channel => {
		channel.name = db_cryptr.decrypt(channel.name);
		return channel;
	});

	ticket.archivedMessages = ticket.archivedMessages.map(message => {
		message.content = db_cryptr.decrypt(message.content);
		return message;
	});

	ticket.archivedUsers = ticket.archivedUsers.map(user => {
		user.displayName = db_cryptr.decrypt(user.displayName);
		user.username = db_cryptr.decrypt(user.username);
		return user;
	});

	if (ticket.feedback?.comment) {
		ticket.feedback.comment = db_cryptr.decrypt(ticket.feedback.comment);
	}

	ticket.questionAnswers = ticket.questionAnswers.map(answer => {
		if (answer.value) answer.value = db_cryptr.decrypt(answer.value);
		return answer;
	});

	return ticket;
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

const file_path = join(process.cwd(), './user/dumps', `${hash}.dump`);

spinner.text = `Writing to "${file_path}"`;

// async to not freeze the spinner
await fse.promises.writeFile(file_path, file_cryptr.encrypt(JSON.stringify(dump)));

spinner.succeed(`Written to "${file_path}"`);
