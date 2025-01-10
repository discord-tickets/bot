import { config } from 'dotenv';
import { program } from 'commander';
import fse from 'fs-extra';
import { join } from 'path';
import ora from 'ora';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import Cryptr from 'cryptr';
// import { inspect } from 'util';

config();

program
	.requiredOption('-g, --guild <id>', 'the ID of the guild to export')
	.option('-f, --force', 'DELETE all data if the guild already exists', false);

program.parse();

const options = program.opts();

const hash = createHash('sha256').update(options.guild).digest('hex');
const file_cryptr = new Cryptr(options.guild);
const db_cryptr = new Cryptr(process.env.ENCRYPTION_KEY);


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

spinner = ora('Reading dump file').start();
const file_path = join(process.cwd(), './user/dumps', `${hash}.dump`);
const dump = JSON.parse(file_cryptr.decrypt(await fse.promises.readFile(file_path, 'utf8')));
spinner.succeed('Read dump file');

spinner = ora('Checking if guild exists').start();
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

spinner = ora('Importing settings & tags').start();
await prisma.guild.create({
	data: {
		...dump.settings,
		id: options.guild,
		tags: {
			create: dump.tags.map(tag => {
				delete tag.guildId;
				return tag;
			}),
		},
	},
});
spinner.succeed(`Imported settings & ${dump.tags.length} tags`);

const category_map = {};
spinner = ora('Importing categories').start();
for (const category of dump.categories) {
	const original_id = category.id;
	delete category.id;
	delete category.guildId;
	category.questions = { create: category.questions };
	const { id: new_id } = await prisma.category.create({
		data: {
			...category,
			guild: { connect: { id: options.guild } },
		},
	});
	category_map[original_id] = new_id;
}
spinner.succeed(`Imported ${dump.categories.length} categories`);

spinner = ora('Importing tickets').start();
for (const i in dump.tickets) {
	spinner.text = `Importing tickets (${i}/${dump.tickets.length})`;
	const ticket = dump.tickets[i];
	ticket.category = { connect: { id: category_map[ticket.categoryId] } };

	if (ticket.topic) ticket.topic = db_cryptr.encrypt(ticket.topic);

	ticket.archivedChannels = {
		create: ticket.archivedChannels.map(channel => {
			delete channel.ticketId;
			channel.name = db_cryptr.encrypt(channel.name);
			return channel;
		}),
	};
	// ticket.archivedChannels = undefined;

	ticket.archivedUsers = {
		create: ticket.archivedUsers.map(user => {
			delete user.ticketId;
			user.displayName = db_cryptr.encrypt(user.displayName);
			user.username = db_cryptr.encrypt(user.username);
			return user;
		}),
	};
	// ticket.archivedUsers = undefined;

	ticket.archivedRoles = {
		create: ticket.archivedRoles.map(role => {
			delete role.ticketId;
			return role;
		}),
	};
	// ticket.archivedRoles = undefined;

	// ticket.archivedMessages = {
	// 	create: ticket.archivedMessages.map(message => {
	// 		delete message.ticketId;
	// 		message.content = db_cryptr.encrypt(message.content);
	// 		return message;
	// 	}),
	// };
	const archivedMessages = ticket.archivedMessages.map(message => {
		// delete message.ticketId;
		// message.ticket = { connect: { id: ticket.id } };
		message.content = db_cryptr.encrypt(message.content);
		return message;
	});
	ticket.archivedMessages = undefined;

	if (ticket.feedback) {
		delete ticket.feedback.ticketId;
		delete ticket.feedback.guildId;
		ticket.feedback.guild = { connect: { id: options.guild } };
		if (ticket.feedback.comment) {
			ticket.feedback.comment = db_cryptr.encrypt(ticket.feedback.comment);
		}
		ticket.feedback = { create: ticket.feedback };
	} else {
		ticket.feedback = undefined;
	}

	if (ticket.questionAnswers?.length) {
		ticket.questionAnswers = {
			createMany: ticket.questionAnswers.map(answer => {
				delete answer.ticketId;
				if (answer.value) answer.value = db_cryptr.encrypt(answer.value);
				return answer;
			}),
		};
	} else {
		ticket.questionAnswers = undefined;
	}

	if (ticket.claimedById) {
		ticket.claimedBy = {
			connectOrCreate: {
				create: { id: ticket.claimedById },
				where: { id: ticket.claimedById },
			},
		};
	}
	if (ticket.closedById) {
		ticket.closedBy = {
			connectOrCreate: {
				create: { id: ticket.closedById },
				where: { id: ticket.closedById },
			},
		};
	}
	if (ticket.createdById) {
		ticket.createdBy = {
			connectOrCreate: {
				create: { id: ticket.createdById },
				where: { id: ticket.createdById },
			},
		};
	}



	if (ticket.referencesTicketId) {
		ticket.referencesTicket = { connect: { id: ticket.referencedTicketId } };
	}
	ticket.guild = { connect: { id: options.guild } };

	delete ticket.categoryId;
	delete ticket.guildId;
	delete ticket.claimedById;
	delete ticket.closedById;
	delete ticket.createdById;
	delete ticket.referencesTicketId;

	// console.log(inspect(ticket, false, Infinity));

	await prisma.ticket.create({ data: ticket });
	await prisma.archivedMessage.createMany({ data: archivedMessages });
}
spinner.succeed(`Imported ${dump.tickets.length} tickets`);
