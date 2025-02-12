const { expose } = require('threads/worker');
const Cryptr = require('cryptr');
const {
	encrypt,
	decrypt,
} = new Cryptr(process.env.ENCRYPTION_KEY);

expose({
	decrypt,
	encrypt,
});
