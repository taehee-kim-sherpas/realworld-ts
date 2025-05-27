import { default as supertest } from 'supertest';
import { createServer } from ".";
import type { AppContext } from "../context";
import type { App } from 'supertest/types';

export async function setupTestServer(ctx: AppContext) {
    const app = createServer(ctx);

    return {
        async fetch(request: Request): Promise<Response> {
            const url = new URL(request.url)
            const req = supertest(app)
                [request.method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete"](url.pathname + (url.search ? (`?${url.search}`) : ""))
                ;
            const req2 = [...request.headers].reduce((acc, [k, v]) => {
                return acc.set(k, v);
            }, req)

            const res = await (request.headers.get("Content-Type") === "application/json" ?
              req2.send(await request.json() as object):
              req2)
            
            return new Response(JSON.stringify(res.body), {
                status: res.statusCode,
                headers: new Headers(JSON.parse(JSON.stringify(res.headers))),
            });
        },
        teardown: async () => {},
    };
}
