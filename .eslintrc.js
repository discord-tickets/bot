module.exports = {
	'env': {
		'commonjs': true,
		'es2021': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 12
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'off',
			'windows'
		],
		'prefer-const': [
			'error',
			{
				'destructuring': 'all',
				'ignoreReadBeforeAssign': false
			}
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
	}
};