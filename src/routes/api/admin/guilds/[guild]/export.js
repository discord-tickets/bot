const { Readable } = require('node:stream');
const archiver = require('archiver');
const { iconURL } = require('../../../../../lib/misc');
const pkg = require('../../../../../../package.json');
const { pools } = require('../../../../../lib/threads');

const { export: pool } = pools;

/**
 * Tracks currently running exports to prevent spamming exports
 */
const exportsRunning = {};
const exportTasks = {};

/**
 * Release a ticket export lock
 * @param id
 */
function releaseExport(id) {
	delete exportsRunning[id];
	const tasks = exportTasks[id];
	// cancel all still running tasks to prevent clogging up threads for an already aborted request
	if (tasks && tasks.length > 0) {
		tasks.forEach(task => {
			try {
				task.cancel();
			}catch (e){ /* empty */ }
		});
	}
	delete exportTasks[id];
}

module.exports.get = fastify => ({
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

		client.log.info(`${member.user.username} requested an export of "${guild.name}"`);

		// Check if an export is already running for this guild
		if (Object.keys(exportsRunning).includes(id)) {
			const time = exportsRunning[id];
			// Check if a minute has already passed - something probably failed but prevented this guild to be removed from the list
			if (time + 60000 <= (new Date().getDate())) {
				exportsRunning[id] = new Date().getTime();
			} else {
				return res.status(429).send('An export is already running. Please wait for it to finish and try again afterwards.');
			}
		} else {
			exportsRunning[id] = new Date().getTime();
		}

		// Detect if this request is aborted or closed and stop the export threads
		req.raw.on('close', () => {
			releaseExport(id);
		});

		// TODO: sign so the importer can ensure files haven't been added (important for attachments)
		const archive = archiver('zip', {
			comment: JSON.stringify({
				exportedAt: new Date().toISOString(),
				exportedFromClientId: client.user.id,
				originalGuildId: id,
				originalGuildName: guild.name,
				version: pkg.version,
			}),
		});

		archive.on('warning', err => {
			if (err.code === 'ENOENT') {
				client.log.warn(err);
			} else {
				throw err;
			}
		});

		archive.on('error', err => {
			releaseExport(id);
			throw err;
		});

		const settings = await client.prisma.guild.findUnique({
			include: {
				categories: { include: { questions: true } },
				tags: true,
			},
			where: { id },
		});

		delete settings.id;

		settings.categories = settings.categories.map(c => {
			delete c.guildId;
			return c;
		});

		settings.tags = settings.tags.map(t => {
			delete t.guildId;
			return t;
		});

		// V1
		const ticketsStream = Readable.from(ticketsGenerator());

		async function* ticketsGenerator() {
			try {
				let done = false;
				const take = 50;
				const findOptions = {
					include: {
						archivedChannels: true,
						archivedMessages: true,
						archivedRoles: true,
						archivedUsers: true,
						feedback: true,
						questionAnswers: true,
					},
					orderBy: { id: 'asc' },
					take,
					where: { guildId: id },
				};
				// create worker index array
				if (!exportTasks[id]) {
					exportTasks[id] = [];
				}

				do {
					const batch = await client.prisma.ticket.findMany(findOptions);
					if (batch.length < take) {
						done = true;
					} else {
						findOptions.skip = 1;
						findOptions.cursor = { id: batch[take - 1].id };
					}
					// ! map (parallel) not for...of (serial)
					yield* batch.map(async ticket => {
						const task = pool.queue(w => w.exportTicket(ticket));
						exportTasks[id].push(task);
						return await task + '\n';
					});
					// Readable.from(AsyncGenerator) seems to be faster than pushing to a Readable with an empty `read()` function
					// for (const ticket of batch) {
					// 	pool
					// 		.queue(worker => worker.exportTicket(ticket))
					// 		.then(string => ticketsStream.push(string + '\n'));
					// }
				} while (!done);
			} finally {
				ticketsStream.push(null); // ! extremely important
			}
		}

		// V2
		// const ticketsStream = Readable.from(ticketsGenerator());
		// async function* ticketsGenerator() {
		// 	try {
		// 		let done = false;
		// 		const take = 50;
		// 		const findOptions = {
		// 			include: {
		// 				archivedChannels: true,
		// 				archivedMessages: true,
		// 				archivedRoles: true,
		// 				archivedUsers: true,
		// 				feedback: true,
		// 				questionAnswers: true,
		// 			},
		// 			orderBy: { id: 'asc' },
		// 			take,
		// 			where: { guildId: id },
		// 		};
		// 		// create worker index array
		// 		if (!exportTasks[id]) {
		// 			exportTasks[id] = [];
		// 		}
		//
		// 		do {
		// 			const batch = await client.prisma.ticket.findMany(findOptions);
		// 			if (batch.length < take) {
		// 				done = true;
		// 			} else {
		// 				findOptions.skip = 1;
		// 				findOptions.cursor = { id: batch[take - 1].id };
		// 			}
		// 			// ! map (parallel) not for...of (serial)
		// 			// yield* batch.map(async ticket => (await pool.queue(w => w.exportTicket(ticket)) + '\n'));
		// 			client.log.info(`Batch ${exportTasks[id].length}: queued`);
		// 			const queuedPool = pool.queue(async w => w.exportTicketBatch(batch));
		// 			exportTasks[id].push(queuedPool);
		// 			queuedPool.then(result => {
		// 				const qPool = queuedPool;
		// 				const index = exportTasks[id].indexOf(qPool);
		// 				client.log.info(`Batch ${index}: finished`);
		// 				// Maybe remove task from list, but not for now, as we do that at the end
		// 				// exportTasks[id].splice(index, 1);
		// 			});
		// 		} while (!done);
		// 	} finally {
		// 		yield* exportTasks[id];
		// 		ticketsStream.push(null); // ! extremely important
		// 	}
		// }

		const icon = await fetch(iconURL(guild));
		archive.append(Readable.from(icon.body), { name: 'icon.png' });
		archive.append(JSON.stringify(settings), { name: 'settings.json' });
		archive.append(ticketsStream, { name: 'tickets.jsonl' });
		archive.finalize(); // ! do not await

		const cleanGuildName = guild.name.replace(/\W/g, '_').replace(/_+/g, '_');
		const fileName = `tickets-${cleanGuildName}-${new Date().toISOString().slice(0, 10)}.zip`;

		res
			.type('application/zip')
			.header('content-disposition', `attachment; filename="${fileName}"`)
			.send(archive)
			// Release export lock on request closure or error
			.then(() => releaseExport(id), () => releaseExport(id));
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
