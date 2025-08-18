import globals from 'globals';
import pluginJs from '@eslint/js';
import eartharoid from '@eartharoid/eslint-rules-js';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	eartharoid,
	{
		rules: {
			'no-console': [
				'warn',
			],
		},
	},
];
