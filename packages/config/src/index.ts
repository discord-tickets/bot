import { $$getConfigProvider } from '@discord-tickets/macros' with { type: 'macro' };
import type ConsulConfig from './consul';

const { default: ConfigProvider }: { default: typeof ConsulConfig } = await import(`./${$$getConfigProvider()}`);

export default new ConfigProvider();
export * from './schema';
