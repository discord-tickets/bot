import {
	describe,
	beforeAll,
	expect,
	test,
	afterAll,
} from 'bun:test';
import schema from '../tests/fixtures/schema';
import Config from './config';

const path = Bun.resolveSync('../tests/fixtures/sample.toml', import.meta.dir);

describe('Config (unit) [1]', () => {
	let config: Config<typeof schema>;

	beforeAll(async () => {
		config = new Config(path, schema);
		await config.load();
	});

	afterAll(() => {
		config.controller?.abort('end of tests');
	});

	test('very deep', async () => {
		const val = config.get('n.o.q');
		expect(val).toEqual({ r: { deep: true } });
	});

	test('valid "get"', async () => {
		const val = config.get('c.e.f');
		expect(val).toBe(1);
	});

});

describe('Config (unit) [2]', () => {
	let config: Config<typeof schema>;

	beforeAll(async () => {
		config = new Config(path, schema);
	});

	test('"load" not awaited', async () => {
		expect(() => config.get('a')).toThrow(/not loaded/);
	});


});


