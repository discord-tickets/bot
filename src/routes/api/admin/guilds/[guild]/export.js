const {
	spawn,
	Pool,
	Worker,
} = require('threads');
const { Readable } = require('node:stream');
const { cpus } = require('node:os');
const archiver = require('archiver');
const { iconURL } = require('../../../../../lib/misc');
const pkg = require('../../../../../../package.json');

// ! ceiL: at least 1
const poolSize = Math.ceil(cpus().length / 4);
const pool = Pool(() => spawn(new Worker('../../../../../lib/workers/export.js')), { size: poolSize });

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
			if (err.code === 'ENOENT') client.log.warn(err);
			else throw err;
		});

		archive.on('error', err => {
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

		const ticketsStream = Readable.from(ticketsGenerator());
		async function* ticketsGenerator() {
			try {
				let done = false;
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
					take: 24,
					where: { guildId: id },
				};
				do {
					const batch = await client.prisma.ticket.findMany(findOptions);
					if (batch.length < findOptions.take) {
						done = true;
					} else {
						findOptions.skip = 1;
						findOptions.cursor = { id: batch[findOptions.take - 1].id };
					}
					// ! map (parallel) not for...of (serial)
					yield* batch.map(async ticket => (await pool.queue(worker => worker.exportTicket(ticket)) + '\n'));
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

		const icon = await fetch(iconURL(guild));
		archive.append(Readable.from(icon.body), { name: 'icon.png' });
		archive.append(JSON.stringify(settings), { name: 'settings.json' });
		archive.append(ticketsStream, { name: 'tickets.jsonl' });
		archive.finalize(); // ! do not await

		const cleanGuildName = guild.name.replace(/\W/g, '_').replace(/_+/g, '_');
		const fileName = `tickets-${cleanGuildName}-${new Date().toISOString().slice(0, 10)}`;

		res
			.type('application/zip')
			.header('content-disposition', `attachment; filename="${fileName}"`)
			.send(archive);
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
