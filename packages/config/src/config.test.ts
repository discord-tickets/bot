import {
	afterAll,
	beforeEach,
	describe,
	expect,
	test,
} from 'bun:test';
import schema from '../tests/fixtures/schema';
import Config from './config';

const path = Bun.resolveSync('../tests/fixtures/sample.toml', import.meta.dir);

describe('unit: Config', () => {
	let config: Config<typeof schema>;

	beforeEach(async () => {
		config = new Config(path, schema);
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
		config = new Config(path, schema);
		expect(() => config.get('a')).toThrow(/not loaded/);
	});


});


