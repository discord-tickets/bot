import { config } from 'dotenv';
import { program } from 'commander';
import fse from 'fs-extra';
import { join } from 'path';
import ora from 'ora';
import { PrismaClient } from '@prisma/client';

config();

program
	.requiredOption('-g, --guild <id>', 'the ID of the guild to export')
	.option('-f, --force', 'DELETE all data if the guild already exists', false);

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

spinner.text = 'Reading dump file';
const file_path = join(process.cwd(), './user/dumps', `${options.guild}.json`);
const dump = JSON.parse(await fse.promises.readFile(file_path, 'utf8'));
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

spinner.text = 'Importing settings';
await prisma.guild.create({ data: dump.settings });
spinner.succeed('Imported settings');

spinner.text = 'Importing categories';

for (const category of dump.categories) {
	delete category.id;
	await prisma.category.create({ data: category });
}
