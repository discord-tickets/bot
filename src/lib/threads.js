const {
	spawn,
	Pool,
	Thread,
	Worker,
} = require('threads');
const { cpus } = require('node:os');

/**
 * Use a thread pool of a fixed size
 * @param {number} size number of threads
 * @param {string} name name of file in workers directory
 * @param {function} fun async function
 * @returns {Promise<any>}
 */
async function pool(size, name, fun) {
	const pool = Pool(() => spawn(new Worker(`./workers/${name}.js`)), { size });
	try {
		return await fun(pool);
	} finally {
		await pool.settled();
		await pool.terminate();
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
		await Thread.terminate(thread);
	}
};

/**
 * Use a thread pool of a variable size
 * @param {number} size fraction of available CPU cores to use (ceil'd)
 * @param {string} name name of file in workers directory
 * @param {function} fun async function
 * @returns {Promise<any>}
 */
function relativePool(fraction, ...args) {
	// ! ceiL: at least 1
	const poolSize = Math.ceil(fraction * cpus().length);
	return pool(poolSize, ...args);
}

module.exports = {
	pool,
	quick,
	relativePool,
};
