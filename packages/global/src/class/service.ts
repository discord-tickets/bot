import type { Logger } from '@discord-tickets/logger';

export class Service {
	#name: string | undefined;
	readonly log: Logger;
	loggers: Map<string, Logger> = new Map();

	constructor(log: Logger) {
		this.log = log;
	}

	get name() {
		if (!this.#name) throw new Error('service has not been named');
		return this.#name;
	}

	set name(value) {
		if (this.#name) throw new Error('service cannot be renamed');
		this.#name = value;
		this.log.setBindings({ service: this.#name });
		// child loggers don't update automatically
		this.loggers.get('config')?.setBindings({ service: this.#name });
		this.log.info('service launched');
	}

	logWithName(name: string): Logger {
		if (this.loggers.has(name)) {
			return this.loggers.get(name) as Logger;
		}
		const child = this.log.child({ name });
		this.loggers.set(name, child);
		return child;
	}
}
