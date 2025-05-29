import { default as supertest } from "supertest";
import { Test } from "@nestjs/testing";
import { ArticlesModule } from "./articles/articles.module.ts";
import type { AppContext } from "../context.ts";
import { CommentsModule } from "./comments/comments.module.ts";

export async function setupTestServer(ctx: AppContext) {
  const moduleRef = await Test.createTestingModule({
    imports: [ArticlesModule, CommentsModule],
  })
    .overrideProvider("APP_CONTEXT")
    .useValue(ctx)
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const req = supertest(app.getHttpServer())[
        request.method.toLowerCase() as
          | "get"
          | "post"
          | "put"
          | "patch"
          | "delete"
      ](url.pathname + (url.search ? `?${url.search}` : ""));
      const req2 = [...request.headers].reduce((acc, [k, v]) => {
        return acc.set(k, v);
      }, req);

      const res = await (request.headers.get("Content-Type") ===
      "application/json"
        ? req2.send((await request.json()) as object)
        : req2);

      return new Response(JSON.stringify(res.body), {
        status: res.statusCode,
        headers: new Headers(JSON.parse(JSON.stringify(res.headers))),
      });
    },
    teardown: async () => {
      await app.close();
    },
  };
}
