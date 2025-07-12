import {
	afterAll,
	beforeAll,
	describe,
	expect,
	test,
} from 'bun:test';
import {
	mkdtemp,
	rm,
} from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import schema from '../fixtures/schema';
import Config from '../../src/config';

const s = await Bun.resolve('../fixtures/sample.toml', import.meta.dir);

describe('integration: Config', () => {
	let config: Config<typeof schema>;
	let dir: string;
	let f: string;

	beforeAll(async () => {
		dir = await mkdtemp(join(tmpdir(), 'test-'));
		f = join(dir, 'sample.toml');
		await Bun.write(f, Bun.file(s));
		config = new Config(f, schema);
		await config.load();
	});

	afterAll(() => {
		config.controller?.abort();
		rm(dir);
	});

	test('get', () => {
		const val = config.get('c.e');
		expect(val).toEqual({ f: 1 });
	});

	test('watch', async done => {
		config.watch(['c.d', 'c.e.f'], (cd, cef) => {
			expect(cd).toBe('music');
			expect(cef).toBe(117);
			done();
		});
		const t_in = await Bun.file(f).text();
		const t_out = t_in
			.replace('d = "dog"', 'd = "music"')
			.replace('e = { f = 1 }', 'e = { f = 117 }');
		await Bun.write(f, t_out);
	});

});


