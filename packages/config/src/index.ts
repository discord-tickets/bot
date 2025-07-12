// type=file to embed in SEA
import default_config from '../assets/default.toml' with { type: 'file' };;
import debug from './debug';
import schema from './schema';
import Config from './config';

const path = './data/config.toml';

if (!await Bun.file(path).exists()) {
	debug('copying defaults');
	await Bun.write(path, Bun.file(default_config));
}

const config = new Config<typeof schema>(path, schema);
await config.load();

export default config;
export * as Config from './config';
export * as schema from './schema';