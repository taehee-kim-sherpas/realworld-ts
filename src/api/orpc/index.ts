import slugify from "cjk-slug";
import createFakeArticleRepo from "../../persistence/FakeArticleRepo";
import type { AppContext } from "../context";
import createFakeCommentRepo from "../../persistence/FakeCommentRepo";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { createArticlesRoutes } from "./articles";
import { createCommentsRoutes } from "./comments";
import { AlreadyExistError, NotExistError } from "../../domain/errors";
import type { StandardHandleResult } from "@orpc/server/standard";
import { ORPCError } from "@orpc/server";

export function createRouter(ctx: AppContext) {
	return {
		articles: {
			...createArticlesRoutes(ctx),
			comments: createCommentsRoutes(ctx),
		},
	};
}

export function createApp(ctx: AppContext) {
	const router = createRouter(ctx);

	const handler = new OpenAPIHandler(router, {
		interceptors: [
			async (options) => {
				try {
					return await options.next();
				} catch (error) {
					if (error instanceof NotExistError) {
						return {
							matched: true,
							response: new Response(error.message, {
								status: 404,
							}),
						} as unknown as StandardHandleResult;
					}
					if (error instanceof AlreadyExistError) {
						return {
							matched: true,
							response: new Response(error.message, {
								status: 409,
							}),
						} as unknown as StandardHandleResult;
					}
					if (
						error instanceof ORPCError &&
						error.message === "Input validation failed"
					) {
						return {
							matched: true,
							response: new Response(error.message, {
								status: 422,
							}),
						} as unknown as StandardHandleResult;
					}

					console.error("hey", error);
					throw error;
				}
			},
		],
	});

	return {
		fetch: (request: Request) =>
			handler.handle(request).then(async (result) => {
				if (result.matched) {
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
