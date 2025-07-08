import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import {
	defineConfig,
	globalIgnores,
} from 'eslint/config';
import eartharoid from '@eartharoid/eslint-rules-js';

export default defineConfig([
	globalIgnores(['CHANGELOG.md, LICENSE.md']),
	{
		extends: [
			'js/recommended',
			eartharoid,
			{
				rules: {
					'no-console': [
						'warn',
					],
				},
			},

		],
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		languageOptions: { globals: globals.node },
	},
	tseslint.configs.recommended,
	{
		extends: ['json/recommended'],
		files: ['**/*.json'],
		language: 'json/json',
		plugins: { json },
	},
	{
		extends: ['json/recommended'],
		files: ['**/*.jsonc', '**/tsconfig.json'],
		language: 'json/jsonc',
		plugins: { json },
	},
	{
		extends: ['json/recommended'],
		files: ['**/*.json5'],
		language: 'json/json5',
		plugins: { json },
	},
	{
		extends: [
			'markdown/recommended',
			{ rules: { 'markdown/no-missing-label-refs': 'off' } },
		],
		files: ['**/*.md'],
		language: 'markdown/gfm',
		plugins: { markdown },
	},
]);
