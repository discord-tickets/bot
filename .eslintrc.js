module.exports = {
	'env': {
		'node': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 2021
	},
	'rules': {
		'indent': [
			'warn',
			'tab'
		],
		'quotes': [
			'warn',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
	}
};