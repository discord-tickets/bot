import { type Schema } from './schema';

type ValuesOfKeys<K extends (keyof Schema)[]> = { [I in keyof K]: Exclude<Schema[K[I]], undefined> }

export default abstract class Config {
	store: Schema = {};
	initialised = false;
	#timer: NodeJS.Timeout;
	watched: Map<keyof Schema, unknown[]> = new Map();
	watchers: Map<unknown, (keyof Schema)[]> = new Map();
	// watched: Partial<Record<keyof Schema, unknown[]>> = {};

	constructor() {
		this.#timer = setInterval(this.reload.bind(this), 60e3);
		this.#timer.unref();
	}

	has(key: keyof Schema) {
		return Object.prototype.hasOwnProperty.call(this.store, key);
	}

	get<K extends keyof Schema>(key: K) {
		if (this.has(key) && this.store[key] !== undefined) {
			return <Exclude<Schema[K], undefined>>this.store[key];
		} else if (this.initialised === false){
			throw new Error('"load" must be called and awaited');
		} else {
			throw new Error(`Property "${key}" is not defined`);
		}
	}

	watch<K extends (keyof Schema)[]>(
		keys: [...K],
		callback: (...values: ValuesOfKeys<K>) => void,
	) {
		this.watchers.set(callback, keys);
		for (const key of keys) {
			if (!this.watched.has(key)) {
				this.watched.set(key, [callback]);
			} else {
				this.watched.get(key)?.push(callback);
			}
		}
	}

	abstract load(prefixes: string[]): Promise<void>

	abstract reload(): Promise<void>
}

