const fs = require('fs');
const { join } = require('path');
const { path } = require('../utils/fs');

class CommandManager {
	constructor(client) {
		this.client = client;
		this.commands = new Map();
	}

	load(command) {

	}

	unload(command) {

	}

	reload(command) {

	}

	get(command) {

	}

	get list() {
		return this.commands;
	}
}

class Command {
	constructor(client) {

	}
}

module.exports = {
	CommandManager,
	Command
};