module.exports = {
	method: 'get',
	route: '/auth/login',
	execute: async (plugin, req, res) => {

		let url = new URL('https://discord.com/api/oauth2/authorize');
		url.searchParams.append('client_id', plugin.client.user.id);
		url.searchParams.append('redirect_uri', plugin.redirect_uri);
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('scope', 'identify guilds');
		url.searchParams.append('state', 'apollo');

		res.redirect(307, url);
		
	}
};