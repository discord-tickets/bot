import type { Logger } from '@discord-tickets/logger';
import { z } from 'zod/v4';
import { resolve } from 'node:path';
import { parse } from 'smol-toml';
import { watch } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import {
	MAX_DEPTH,
	type DeepKeys,
	type GetValueType,
} from '../deepkeys';

export class Config<S extends z.ZodType> {
	controller: AbortController | null = null;
	log: Logger;
	path: string;
	schema: S;
	store: Map<DeepKeys<z.infer<S>>, GetValueType<z.infer<S>, DeepKeys<z.infer<S>>>> = new Map();
	watched: Map<DeepKeys<z.infer<S>>, unknown[]> = new Map();
	watchers: Map<unknown, (DeepKeys<z.infer<S>>)[]> = new Map();

	constructor(log: Logger, path: string, schema: S) {
		this.path = resolve(path);
		this.schema = schema;
		this.log = log;
		this.log.debug({ file: this.path }, 'config constructed');
	}

	get<K extends DeepKeys<z.infer<S>>>(key: K): GetValueType<z.infer<S>, K> {
		if (this.store.has(key)) {
			return this.store.get(key) as GetValueType<z.infer<S>, K>;
		} else {
			throw new Error(`Property "${String(key)}" is not loaded`);
		}
	}

	async #watch() {
		this.log.debug('started watching file');
		this.controller = new AbortController();
		const { signal } = this.controller;
		try {
			const watcher = watch(this.path, { signal });
			for await (const _event of watcher) {
				this.log.debug('file updated');
				this.load();
			}
		} catch (err) {
			this.controller = null;
			if ((<Error>err).name !== 'AbortError') {
				this.log.fatal({ err }, 'stopped watching file');
			}
			this.log.warn('watcher aborted');
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
		this.log.debug({ watching: this.watched.keys().toArray() }, 'watching keys');
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

	// this wrapper is to stop TS complaining
	flatten(object: z.infer<S>) {
		return this.#flatten(object);
	}

	async load(): Promise<void> {
		let data, validated;
		try {
			// import() can load TOML but querystring cache busting doesn't work
			data = parse(await Bun.file(this.path).text());
		} catch (err) {
			this.log.fatal({ err }, 'Failed to parse config file');
			return;
		}
		try {
			validated = this.schema.parse(data);
		} catch (err) {
			this.log.fatal({ err }, 'Failed to validate config file');
			return;
		}
		const flat = new Map(this.flatten(validated)) as Map<DeepKeys<z.infer<S>>, GetValueType<z.infer<S>, DeepKeys<z.infer<S>>>>;
		for (const key of this.watched.keys()) {
			const from = this.store.get(key);
			const to = flat.get(key);
			if (!isDeepStrictEqual(from, to)) {
				this.log.info({
					from,
					to,
				}, 'watched key %s updated', key);
				for (const watcher of this.watched.get(key)!) {
					const values = this.watchers.get(watcher)?.map(k => flat.get(k));
					this.log.trace({ values }, 'calling watcher for key %s', key);
					// @ts-expect-error: watcher is a function
					watcher(...values);
				}
			}
		}
		this.store = flat;
	}
}
