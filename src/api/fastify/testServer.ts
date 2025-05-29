import { createFastify } from ".";
import type { AppContext } from "../context";

export function setupTestServer(ctx: AppContext) {
  const app = createFastify(ctx);
  return {
    async fetch(request: Request): Promise<Response> {
      const res = await app.inject({
        method: request.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        url: request.url,
        headers: Object.fromEntries(request.headers),
        payload:
          request.headers.get("Content-Type") === "application/json"
            ? ((await request.json()) as object)
            : undefined,
      });

      return new Response(res.body, {
        status: res.statusCode,
        headers: new Headers(JSON.parse(JSON.stringify(res.headers))),
      });
    },
    teardown: async () => {
      await app.close();
    },
  };
}
