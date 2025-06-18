import slugify from "cjk-slug";
import createFakeArticleRepo from "../../persistence/FakeArticleRepo";
import type { AppContext } from "../context";
import createFakeCommentRepo from "../../persistence/FakeCommentRepo";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { createArticlesRoutes } from "./articles";
import { createCommentsRoutes } from "./comments";

export function createApp(ctx: AppContext) {
	const router = {
		articles: {
			...createArticlesRoutes(ctx),
			comments: createCommentsRoutes(ctx),
		},
	};

	const handler = new OpenAPIHandler(router);

	return {
		fetch: (request: Request) =>
			handler.handle(request).then(async (result) => {
				if (result.matched) {
					if (result.response.status === 400) {
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						const body = (await result.response.json()) as any;
						if (body.message === "Input validation failed") {
							return new Response(JSON.stringify(body.data), {
								status: 422,
								headers: {
									"Content-Type": "application/json",
								},
							});
						}

						return new Response(JSON.stringify(body), {
							status: 400,
							headers: {
								"Content-Type": "application/json",
							},
						});
					}
					return result.response;
				}

				return new Response(
					JSON.stringify({
						error: "Not found",
					}),
					{
						status: 404,
						headers: {
							"Content-Type": "application/json",
						},
					},
				);
			}),
	};
}

export default createApp({
	getNow() {
		return new Date();
	},
	repo: {
		article: createFakeArticleRepo({}),
		comment: createFakeCommentRepo({}),
	},
	slugify,
	generateId() {
		return crypto.randomUUID();
	},
});
