const { expose } = require('threads/worker');
const {
	decrypt, encrypt,
} = require('../crypto');

expose({
	decrypt,
	encrypt,
});