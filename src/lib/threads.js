const {
	spawn,
	Pool,
	Thread,
	Worker,
} = require('threads');
const { cpus } = require('node:os');

/**
 * Create a single-use thread pool
 * @param {number} num fraction of available CPUs to use (ceil'd), or absolute number
 * @param {string} name name of file in workers directory
 * @param {function} fun async function
 * @param {import('threads/dist/master/pool').PoolOptions} options
 * @returns {Promise<any>}
 */
async function quickPool(num, name, fun, options) {
	const pool = reusablePool(num, name, options);
	try {
		return await fun(pool);
	} finally {
		pool.settled().then(() => pool.terminate());
	}
};

/**
 * Create a multi-use thread pool
 * @param {number} num fraction of available CPUs to use (ceil'd), or absolute number
 * @param {string} name name of file in workers directory
 * @param {import('threads/dist/master/pool').PoolOptions} options
 */
function reusablePool(num, name, options) {
	const size = num < 1 ? Math.ceil(num * (parseInt(process.env.CPU_LIMIT) || cpus().length)) : num;
	const pool = Pool(() => spawn(new Worker(`./workers/${name}.js`)), {
		...options,
		size,
	});
	return pool;
};

/**
 * Spawn one thread, do something, and terminate it
 * @param {string} name name of file in workers directory
 * @param {function} fun async function
 * @returns {Promise<any}
 */
async function quick(name, fun) {
	const thread = await spawn(new Worker(`./workers/${name}.js`));
	try {
		// ! this await is extremely important
		return await fun(thread);
	} finally {
		Thread.terminate(thread);
	}
};

/**
 * Spawn one thread
 * @param {string} name name of file in workers directory
 * @returns {Promise<{terminate: function}>}
 */
async function reusable(name) {
	const thread = await spawn(new Worker(`./workers/${name}.js`));
	thread.terminate = () => Thread.terminate(thread);
	return thread;
};

const pools = {
	crypto: reusablePool(.5, 'crypto'),
	export: reusablePool(.33, 'export'),
	import: reusablePool(.33, 'import'),
	stats: reusablePool(.25, 'stats'),
	transcript: reusablePool(.5, 'transcript'),
};

module.exports = {
	pools,
	quick,
	quickPool,
	reusable,
	reusablePool,
};
