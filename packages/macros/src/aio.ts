export function $$isAIO() {
	return process.env.SERVICE === 'aio';
}

export function $$getConfigProvider() {
	return $$isAIO() ? 'toml' : 'consul';
}