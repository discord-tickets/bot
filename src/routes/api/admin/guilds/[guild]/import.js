
const {
	spawn,
	Pool,
	Worker,
} = require('threads');
const { cpus } = require('node:os');
const unzipper = require('unzipper');
const { createInterface } = require('node:readline');
const pkg = require('../../../../../../package.json');

// a single persistent pool shared across all imports
const poolSize = Math.ceil(cpus().length / 4); // ! ceiL: at least 1
const pool = Pool(() => spawn(new Worker('../../../../../lib/workers/import.js')), { size: poolSize });

function parseJSON(string) {
	try {
		return JSON.parse(string);
	} catch {
		return null;
	}
}

// put would be better but forms can only get or post
module.exports.post = fastify => ({
	/**
	 *
	 * @param {import('fastify').FastifyRequest} req
	 * @param {import('fastify').FastifyReply} res
	 */
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const id = req.params.guild;
		const guild = client.guilds.cache.get(id);
		const member = await guild.members.fetch(req.user.id);

		client.log.info(`${member.user.username} is importing data to "${guild.name}"`);

		client.keyv.delete(`cache/stats/guild:${id}`);

		const [zFile] = await req.saveRequestFiles({
			limits: {
				fields: 1,
				files: 1,
			},
		});

		res.raw.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

		const userLog = {
			error(string) {
				this.write('text-red-500 font-bold', 'text-red-700 dark:text-red-200', 'ERROR', string);
			},
			info(string) {
				this.write('text-cyan-500', 'text-cyan-700 dark:text-cyan-200', 'INFO', string);
			},
			success(string) {
				this.write('text-green-500', 'text-green-700 dark:text-green-200', 'SUCCESS', string);
			},
			warn(string) {
				this.write('text-orange-500', 'text-orange-700 dark:text-orange-200', 'WARN', string);
			},
			write(style1, style2, prefix, string) {
				res.raw.write(`<p><span class="${style1}">[${prefix}]</span> <span class="${style2}">${string}</span></p>`);
			},
		};

		try {
		// comment needs to be less than 512B
			const zip = await unzipper.Open.file(zFile.filepath, { tailSize: 512 });
			const { files } = zip;
			const comment = parseJSON(zip.comment);
			client.log.info('Import comment', comment);
			if (comment) {
				userLog.info(`v${comment.version} -> v${pkg.version}`);
			} else {
				userLog.warn('Comment is not parsable');
			}

			userLog.info('Reading settings.json');
			// `settingsJSON` is frozen, `settings` can be mutated
			const settingsJSON = JSON.parse(await files.find(f => f.path === 'settings.json').buffer());
			Object.freeze(settingsJSON);
			const settings = structuredClone(settingsJSON);
			const { categories } = settings;
			delete settings.categories; // this also mutates `settings

			userLog.info('Importing general settings and tags');
			await client.prisma.$transaction([
				client.prisma.guild.delete({
					select: { id: true },
					where: { id },
				}),
				client.prisma.guild.create({
					data: {
						...settings,
						id,
						tags: {
							createMany: {
								data: settings.tags.map(tag => {
									delete tag.id;
									return tag;
								}),
							},
						},
					},
					// select ID so it doesn't return everything else
					select: { id: true },
				}),
			]);
			userLog.success(`Imported general settings and ${settings.tags.length} tags`);

			userLog.info('Importing categories');
			const newCategories = await client.prisma.$transaction(
				categories.map(category => {
					delete category.id;
					return client.prisma.category.create({
						data: {
							...category,
							guild: { connect: { id } },
							questions: {
								createMany: {
									data: category.questions.map(question => {
										delete question.categoryId;
										return question;
									}),
								},
							},
						},
						select: { id: true },
					});
				}),
			);

			// settingsJSON.category because categories has been mutated (no id)
			const categoryMap = new Map(settingsJSON.categories.map((cat, idx) => ([cat.id, newCategories[idx].id])));

			for (const category of settingsJSON.categories) {
				userLog.info(`"${category.name}" ID ${category.id} -> ${categoryMap.get(category.id)}`);
			}

			userLog.success(`Imported ${categories.length} categories`);

			userLog.info('Reading tickets.jsonl');
			const stream = files.find(f => f.path === 'tickets.jsonl').stream();
			const lines = createInterface({
				crlfDelay: Infinity,
				input: stream,
			});
			const ticketsPromises = [];

			userLog.info('Encrypting tickets');

			for await (const line of lines) {
				// do not await in the loop
				ticketsPromises.push(pool.queue(worker => worker.importTicket(line, id, categoryMap)));
			}

			// TODO: batch 100 tickets per query?
			const ticketsResolved = await Promise.all(ticketsPromises);
			const queries = [];
			const allMessages = [];

			for (const [ticket, ticketMessages] of ticketsResolved) {
				queries.push(
					client.prisma.ticket.create({
						data: ticket,
						select: { id: true },
					}),
				);
				allMessages.push(...ticketMessages);
			}

			if (allMessages.length > 0) {
				queries.push(client.prisma.archivedMessage.createMany({ data: allMessages }));
			}

			userLog.info('Importing tickets');
			await client.prisma.$transaction(queries);
			userLog.success(`Imported ${ticketsResolved.length} tickets`);
			userLog.success('(DONE) All data has been imported');

		} catch (error) {
			client.log.error(error);
			userLog.error(error);
		} finally {
			res.raw.end();
		}
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
