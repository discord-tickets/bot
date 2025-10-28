const { logAdminEvent } = require('../../../../../../../../lib/logging');

module.exports.delete = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const guildId = req.params.guild;
		const categoryId = Number(req.params.category);
		const questionId = req.params.question;
		const original = questionId && await client.prisma.question.findUnique({ where: { id: questionId } });
		const category = categoryId && await client.prisma.category.findUnique({ where: { id: categoryId } });
		if (original?.categoryId !== categoryId || category.guildId !== guildId) return res.status(400).send(new Error('Bad Request'));
		const question = await client.prisma.question.delete({ where: { id: questionId } });

		logAdminEvent(client, {
			action: 'delete',
			guildId: req.params.guild,
			target: {
				id: question.id,
				name: question.label,
				type: 'question',
			},
			userId: req.user.id,
		});

		return question;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
