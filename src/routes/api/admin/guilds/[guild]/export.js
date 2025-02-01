const { Readable } = require('node:stream');
const { cpus } = require('node:os');
const {
	spawn,
	Pool,
	Worker,
} = require('threads');
const archiver = require('archiver');
const { once } = require('node:events');

// ! ceiL: at least 1
const poolSize = Math.ceil(cpus().length / 4);

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

		const settings = await client.prisma.guild.findUnique({
			include: {
				categories: { include: { questions: true } },
				tags: true,
			},
			where: { id },
		});

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
			const pool = Pool(() => spawn(new Worker('../../../../../lib/workers/export.js')), { size: poolSize });
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
					// ! map not for...of.
					// ! ! batch at a time, many tickets at a time per batch
					const ar = await Promise.all(batch.map(async ticket => (await pool.queue(worker => worker.exportTicket(ticket)) + '\n')));

					yield* ar;
				} while (!done);
			} finally {
				await pool.terminate();
				ticketsStream.push(null); // ! extremely important
			}
		}



		const archive = archiver('zip', {
			comment: JSON.stringify({
				exportedAt: new Date().toISOString(),
				originalGuildId: id,
			}),
		})
			.append(JSON.stringify(settings), { name: 'settings.json' })
			.append(ticketsStream, { name: 'tickets.jsonl' });

		const cleanGuildName = guild.name.replace(/\W/g, '_').replace(/_+/g, '_');
		const fileName = `tickets-${cleanGuildName}-${new Date().toISOString().slice(0, 10)}`;


		res
			.type('application/zip')
			.header('content-disposition', `attachment; filename="${fileName}"`)
			.send(archive);

		await once(ticketsStream, 'end');
		await archive.finalize();
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
