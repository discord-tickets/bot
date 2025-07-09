import { schema } from './schema';
import Config from './config';
import { isDeepStrictEqual } from 'node:util';
/**
 * @emits log
 * @emits update
 */
export default class ConsulConfig extends Config {
	#timer: NodeJS.Timeout;
	prefixes: Set<string> = new Set();

	constructor() {
		super();
		this.#timer = setInterval(this.reload.bind(this), 60e3);
		this.#timer.unref();
	}

	decode(value: string): unknown {
		return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
	}

	async load(prefixes: string[]): Promise<void> {
		await Promise.all(
			prefixes
				.filter(prefix => !this.prefixes.has(prefix))
				.map(prefix => this.reload(prefix)),
		);
		for (const prefix of prefixes) {
			this.prefixes.add(prefix);
		}
		// await this.reload();
		this.initialised ||= true;
	}

	async reload(prefix?: string): Promise<void> {
		const prefixes = prefix ? [prefix] : this.prefixes;
		const chunks: Record<string, unknown>[] = [];
		for (const prefix of prefixes) {
			const res = await fetch(`http://localhost:8500/v1/kv/config/${prefix}?recurse=true`); // TODO: DNS
			const data: { Key: string, Value: string }[] | null = await res.json();
			if (data) {
				const chunk = data.reduce((acc, entry) => {
					acc[entry.Key.slice(7)] = entry.Value ? this.decode(entry.Value) : undefined;
					return acc;
				}, {} as Record<string, unknown>);
				chunks.push(chunk);
			}
		}
		const reloaded = schema.parse(Object.assign({}, ...chunks));
		for (const key of this.watched.keys()) {
			if (!isDeepStrictEqual(this.store[key], reloaded[key])) {
				for (const watcher of this.watched.get(key)!) {
					const values = this.watchers.get(watcher)?.map(k => reloaded[k]);
					// @ts-expect-error: watcher is a function
					watcher(...values);
				}
			}
		}
		// this.store = reloaded;
		 // ! this makes it impossible to unset a key but allows `load` to be called multiple times efficiently
		Object.assign(this.store, reloaded);
	}
}
