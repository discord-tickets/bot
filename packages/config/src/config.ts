import debug from './debug';
import EventEmitter from 'node:events';
import { z } from 'zod/v4';
import { resolve } from 'node:path';
import { parse } from 'smol-toml';
import { watch } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import {
	MAX_DEPTH,
	type DeepKeys,
	type GetValueType,
} from './types';


export default class Config<S extends z.ZodType> extends EventEmitter {
	controller: AbortController | null = null;
	path: string;
	schema: S;
	store: Map<DeepKeys<z.infer<S>>, GetValueType<z.infer<S>, DeepKeys<z.infer<S>>>> = new Map();
	watched: Map<DeepKeys<z.infer<S>>, unknown[]> = new Map();
	watchers: Map<unknown, (DeepKeys<z.infer<S>>)[]> = new Map();

	constructor(path: string, schema: S) {
		super();
		this.path = resolve(path);
		this.schema = schema;
		debug('absolute_path=%s', this.path);
	}

	get<K extends DeepKeys<z.infer<S>>>(key: K): GetValueType<z.infer<S>, K> {
		if (this.store.has(key)) {
			return this.store.get(key) as GetValueType<z.infer<S>, K>;
		} else {
			throw new Error(`Property "${String(key)}" is not loaded`);
		}
	}

	async #watch() {
		debug('watching %s', this.path);
		this.controller = new AbortController();
		const { signal } = this.controller;
		try {
			const watcher = watch(this.path, { signal });
			for await (const _event of watcher) {
				this.load();
			}
		} catch (error) {
			this.controller = null;
			// @ts-expect-error stfu
			if (error?.name !== 'AbortError') {
				throw error;
			}
		}
	}

	watch<K extends (DeepKeys<z.infer<S>>)[]>(
		keys: [...K],
		callback: (...values: { [I in keyof K]: GetValueType<z.infer<S>, K[I]> }) => void,
	) {
		if (!this.controller) {
			this.#watch();
		}
		this.watchers.set(callback, keys);
		for (const key of keys) {
			if (!this.watched.has(key)) {
				this.watched.set(key, [callback]);
			} else {
				this.watched.get(key)?.push(callback);
			}
		}
		debug('watched=', this.watched.keys());
	}

	*#flatten(
		object: z.infer<S>,
		currentPath: string = '',
		depth: number = 0,
	): IterableIterator<[string, unknown]> {
		if (depth >= MAX_DEPTH) {
			return;
		}
		for (const [k, v] of Object.entries(object as Record<string, unknown>)) {
			const newPath = currentPath ? `${currentPath}.${k}` : k;
			yield [newPath, v];
			if (typeof v === 'object' && v !== null && !Array.isArray(v) && depth < MAX_DEPTH) {
				const nested = this.#flatten(
					v as z.infer<S>,
					newPath,
					depth + 1,
				);
				for (const [nested_k, nested_v] of nested) {
					yield [nested_k, nested_v];
				}
			}
		}
	}

	flatten(object: z.infer<S>) {
		return this.#flatten(object);
	}

	async load(): Promise<void> {
		let data, validated;
		try {
			// import() can load TOML but querystring cache busting doesn't work
			data = parse(await Bun.file(this.path).text());
		} catch (error) {
			this.throw(new Error('Failed to parse config file', { cause: error }));
			return;
		}
		try {
			validated = this.schema.parse(data);
		} catch (error) {
			this.throw(new Error('Failed to validate config file', { cause: error }));
			return;
		}
		const flat = new Map(this.flatten(validated)) as Map<DeepKeys<z.infer<S>>, GetValueType<z.infer<S>, DeepKeys<z.infer<S>>>>;
		for (const key of this.watched.keys()) {
			if (!isDeepStrictEqual(this.store.get(key), flat.get(key))) {
				for (const watcher of this.watched.get(key)!) {
					const values = this.watchers.get(watcher)?.map(k => flat.get(k));
					// @ts-expect-error: watcher is a function
					watcher(...values);
				}
			}
		}
		this.store = flat;
	}

	throw(error: unknown) {
		if (this.listenerCount('critical') === 0) {
			// surface the error if it occurs before the logger is ready
			throw error;
		} else {
			// Don't crash the process; either subsequent .get() calls will throw,
			// or existing values can continue to be used.
			// This makes watching for changes safe.
			// Naming the event `error` makes Bun panic but `critical`
			// is also appropriate as other errors are likely to follow (if this is the first load)
			debug('emit:critical');
			this.emit('critical', error);
		}
	}

}