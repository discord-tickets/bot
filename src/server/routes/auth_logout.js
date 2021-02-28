module.exports = {
	method: 'get',
	route: '/auth/logout',
	execute: async (plugin, req, res) => {

		req.session.delete();
		res.send('Logged out successfully');
		
	}
};