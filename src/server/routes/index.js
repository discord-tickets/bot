module.exports = {
	method: 'get',
	route: '/',
	execute: async (plugin, req, res) => {
		
		res.redirect(307, '/auth/login');

	}
};