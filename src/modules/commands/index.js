module.exports = {
	CommandManager: require('./manager'),
	Command: require('./command'),
	OptionTypes: {
		SUB_COMMAND: 1,
		SUB_COMMAND_GROUP: 2,
		STRING: 3,
		INTEGER: 4,
		BOOLEAN: 5,
		USER: 6,
		CHANNEL: 7,
		ROLE: 8,
	},
	ResponseTypes: {
		Pong: 1,
		ChannelMessageWithSource: 4,
		DeferredChannelMessageWithSource: 5,
	},
};