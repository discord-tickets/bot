import {
	describe,
	beforeAll,
	expect,
	test,
} from 'bun:test';
import ConsulConfig from './consul';

describe('Consul', () => {
	let config: ConsulConfig;
	beforeAll(async () => {
		config = new ConsulConfig();
		await fetch('http://localhost:8500/v1/kv/config/global/log_level', {
			body: '"debug"',
			method: 'PUT',
		});
		await fetch('http://localhost:8500/v1/kv/config/interceptor/discord_api_version', {
			body: '"v10"',
			method: 'PUT',
		});
		await fetch('http://localhost:8500/v1/kv/config/nice', {
			body: '69',
			method: 'PUT',
		});
	});

	test('"load" not called', async () => {
		expect(() => config.get('global/log_level')).toThrow(/must be called and awaited/);
	});

	test('"load" not awaited', async () => {
		config.load(['global']);
		expect(() => config.get('global/log_level')).toThrow(/must be called and awaited/);
	});

	test('incorrect prefixes loaded', async () => {
		await config.load(['global']);
		expect(() => config.get('interceptor/discord_api_version')).toThrow(/not defined/);
	});

	test('valid "get"', async () => {
		await config.load(['global', 'interceptor/discord_api_version']);
		const val = config.get('interceptor/discord_api_version');
		expect(val).toBe('v10');
	});

	test('watch', async done => {
		await config.load(['global', 'nice']);
		await fetch('http://localhost:8500/v1/kv/config/global/log_level', {
			body: '"info"',
			method: 'PUT',
		});
		config.watch(['global/log_level', 'nice'], (level, num) => {
			expect(level).toBe('info');
			expect(num).toBe(69);
			done();
		});
		config.reload();
	});


});


