/* eslint-disable sort-keys */
import {
	afterAll,
	beforeEach,
	describe,
	expect,
	test,
	mock,
} from 'bun:test';
import schema from '../../tests/fixtures/schema';
import { Config } from './config';
import type { Logger } from '@discord-tickets/logger';

const silent = mock((..._args: unknown[]) => null);
const log = {
	level: 'trace',
	silent,
	trace: silent,
	debug: silent,
	info: silent,
	warn: silent,
	error: silent,
	fatal: silent,
}  as unknown as Logger;

const path = Bun.resolveSync('../../tests/fixtures/sample.toml', import.meta.dir);

describe('unit: Config', () => {
	let config: Config<typeof schema>;

	beforeEach(async () => {
		config = new Config(log, path, schema);
		await config.load();
	});

	afterAll(() => {
		config.controller?.abort();
	});

	test('very deep', () => {
		const val = config.get('n.o.q');
		expect(val).toEqual({ r: { deep: true } });
	});

	test('valid "get"', () => {
		const val = config.get('c.e.f');
		expect(val).toBe(1);
	});

	test('watch', async done => {
		config.store.set('c.e.f', 69);
		config.watch(['c.d', 'c.e.f'], (cd, cef) => {
			expect(cd).toBe('dog');
			expect(cef).toBe(1);
			done();
		});
		await config.load();
	});

});

describe('unit: Config', () => {
	let config: Config<typeof schema>;

	test('"load" not awaited', () => {
		config = new Config(log, path, schema);
		expect(() => config.get('a')).toThrow(/not loaded/);
	});


});


