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
	.requiredOption('-g, --guild <id>', 'the ID of the guild to export')
	.option('-f, --force', 'DELETE all data if the guild already exists', false);

program.parse();

const options = program.opts();

const hash = createHash('sha256').update(options.guild).digest('hex');
const file_cryptr = new Cryptr(options.guild);
const db_cryptr = new Cryptr(process.env.ENCRYPTION_KEY);


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

spinner.text = 'Reading dump file';
const file_path = join(process.cwd(), './user/dumps', `${hash}.dump`);
const dump = JSON.parse(file_cryptr.decrypt(await fse.promises.readFile(file_path, 'utf8')));
spinner.succeed('Read dump file');

spinner.text = 'Checking if guild exists';
const exists = await prisma.guild.count({ where: { id: options.guild } });
if (exists === 0) {
	spinner.succeed('Guild doesn\'t exist');
} else {
	if (options.force) {
		await prisma.guild.delete({ where: { id: options.guild } });
		spinner.succeed('Deleted guild');
	} else {
		spinner.fail('Guild already exists; run again with --force to delete it');
		process.exit(1);
	}
}

spinner.text = 'Importing settings & tags';
await prisma.guild.create({
	data: {
		...dump.settings,
		tags: { create: dump.tags },
	},
});
spinner.succeed(`Imported settings & ${dump.tags.length} tags`);

const category_map = {};
spinner.text = 'Importing categories';
for (const category of dump.categories) {
	const original_id = category.id;
	delete category.id;
	category.questions = { create: category.questions };
	const { id: new_id } = await prisma.category.create({
		data: {
			...category,
			guild: { connect: { id: options.guild } },
			guildId: options.guild,
		},
	});
	category_map[original_id] = new_id;
}
spinner.succeed(`Imported ${dump.categories.length} categories`);

spinner.text = 'Importing users';
for (const user of dump.users) {
	await prisma.user.create({ data: user });
}
spinner.succeed(`Imported ${dump.users.length} users`);

spinner.text = 'Importing tickets';

for (const ticket of dump.tickets) {
	ticket.categoryId = category_map[ticket.categoryId];
	if (ticket.topic) ticket.topic = db_cryptr.encrypt(ticket.topic);

	ticket.archivedChannels = {
		create: ticket.archivedChannels.map(channel => {
			channel.name = db_cryptr.encrypt(channel.name);
			return channel;
		}),
	};

	ticket.archivedMessages = {
		create: ticket.archivedMessages.map(message => {
			message.content = db_cryptr.encrypt(message.content);
			return message;
		}),
	};

	ticket.archivedUsers = {
		create: ticket.archivedUsers.map(user => {
			user.displayName = db_cryptr.encrypt(user.displayName);
			user.username = db_cryptr.encrypt(user.username);
			return user;
		}),
	};


	if (ticket.feedback) {
		if (ticket.feedback.comment) {
			ticket.feedback.comment = db_cryptr.encrypt(ticket.feedback.comment);
		}
		ticket.feedback = { create: ticket.feedback };
	}

	ticket.questionAnswers = {
		createMany: ticket.questionAnswers.map(answer => {
			if (answer.value) answer.value = db_cryptr.encrypt(answer.value);
			return answer;
		}),
	};

	if (ticket.claimedBy) {
		ticket.claimedBy = {
			connectOrCreate: {
				create: { id: ticket.claimedById },
				where: { id: ticket.claimedById },
			},
		};
	}
	if (ticket.closedBy) {
		ticket.closedBy = {
			connectOrCreate: {
				create: { id: ticket.closedById },
				where: { id: ticket.closedById },
			},
		};
	}
	if (ticket.createdBy) {
		ticket.createdBy = {
			connectOrCreate: {
				create: { id: ticket.createdById },
				where: { id: ticket.createdById },
			},
		};
	}

	await prisma.ticket.create({ data: ticket });
}
spinner.succeed(`Imported ${dump.tickets.length} tickets`);
