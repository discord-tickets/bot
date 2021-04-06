module.exports = {
	int2hex: (int) => int.toString(16).toUpperCase(),
	wait: (time) => new Promise(res => setTimeout(res, time)),
};