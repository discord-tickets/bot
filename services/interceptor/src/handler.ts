import type {
	CreateRequestBodyOptions,
	RequestMethods,
} from '@discordeno/rest';
import { REST } from './rest';

export default async function handler(this: Bun.Server, req: Request): Promise<Response> {
	const options: CreateRequestBodyOptions = {};
	if (req.body) options.body = req.body;

	const url = new URL(req.url);

	if (!url.pathname.startsWith('/api')) {
		return new Response(JSON.stringify({ message: 'Bad path' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400,
		});
	}

	const path = url.pathname.substring(4) + url.search;
	const result = await REST.makeRequest(
			req.method as RequestMethods,
			path,
			options,
	);

	if (result) {
		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		});
	} else {
		return new Response('', {
			headers: { 'Content-Type': 'application/json' },
			status: 204,
		});
	}
}