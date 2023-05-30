// TODO
/*  eslint-disable no-undef */
module.exports = joi.object({
	archive: joi.boolean().optional(),
	autoClose: joi.number().min(3_600_000).optional(),
	autoTag: [joi.array(), joi.string().valid('ticket', '!ticket', 'all')].optional(),
	blocklist: joi.array().optional(),
	createdAt: joi.string().optional(),
	errorColour: joi.string().optional(),
	footer: joi.string().optional(),
	id: joi.string().optional(),
	logChannel: joi.string().optional(),
	primaryColour: joi.string().optional(),
	staleAfter: joi.number().min(60_000).optional(),
	successColour: joi.string().optional(),
	workingHours: joi.array().length(8).items(
		joi.string(),
		joi.array().items(joi.string().required(), joi.string().required()),
		joi.array().items(joi.string().required(), joi.string().required()),
		joi.array().items(joi.string().required(), joi.string().required()),
		joi.array().items(joi.string().required(), joi.string().required()),
		joi.array().items(joi.string().required(), joi.string().required()),
		joi.array().items(joi.string().required(), joi.string().required()),
		joi.array().items(joi.string().required(), joi.string().required()),
	).optional(),
});