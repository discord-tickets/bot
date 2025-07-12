import { z } from 'zod/v4';

export default z.object({
	a: z.string(),
	b: z.number(),
	c: z.object({
		d: z.string(),
		e: z.object({ f: z.number() }),
		g: z.array(z.string()),
		h: z.boolean(),
	}),
	i: z.array(z.object({ j: z.object({ p: z.number() }) })),
	k: z.object({ l: z.object({ m: z.number() }) }),
	n: z.object({ o: z.object({ q: z.object({ r: z.object({ deep: z.boolean() }) }) }) }),
});
