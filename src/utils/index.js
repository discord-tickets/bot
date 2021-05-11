module.exports = {
	int2hex: (int) => int.toString(16).toUpperCase(),
	some: async (array, func) => {
		for (let element of array) {
			if (await func(element)) return true;
		}
		return false;
	},
	wait: (time) => new Promise(res => setTimeout(res, time)),
};