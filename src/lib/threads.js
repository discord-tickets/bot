const {
	spawn,
	Pool,
	Thread,
	Worker,
} = require('threads');
const { cpus } = require('node:os');

/**
 * Use a thread pool of a fixed size
 * @param {string} name name of file in workers directory
 * @param {function} fun async function
 * @param {import('threads/dist/master/pool').PoolOptions} options
 * @returns {Promise<any>}
 */
async function pool(name, fun, options) {
	const pool = Pool(() => spawn(new Worker(`./workers/${name}.js`)), options);
	try {
		return await fun(pool);
	} finally {
		pool.settled().then(() => pool.terminate());
	}
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
 * Use a thread pool of a variable size
 * @param {number} fraction fraction of available CPU cores to use (ceil'd)
 * @param {string} name name of file in workers directory
 * @param {function} fun async function
 * @param {import('threads/dist/master/pool').PoolOptions} options
 * @returns {Promise<any>}
 */
function relativePool(fraction, name, fun, options) {
	// ! ceiL: at least 1
	const size = Math.ceil(fraction * cpus().length);
	return pool(name, fun, {
		...options,
		size,
	});
}

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

module.exports = {
	pool,
	quick,
	relativePool,
	reusable,
};
