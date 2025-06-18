import slugify from "cjk-slug";
import createFakeArticleRepo from "../../persistence/FakeArticleRepo";
import type { AppContext } from "../context";
import createFakeCommentRepo from "../../persistence/FakeCommentRepo";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ORPCError, os } from "@orpc/server";
import {
	CreateUpdateArticleRequestBody,
	MultipleArticlesResponse,
	SingleArticleResponse,
} from "../../schema/typebox/articles";
import * as t from "@sinclair/typebox";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import {
	MultipleCommentsResponse,
	SingleCommentResponse,
} from "../../schema/typebox/comments";
import { StandardSchema } from "../../schema/typebox/standard";
import { createComment } from "../../domain/articles/comments/Comment";

export function createApp(ctx: AppContext) {
	const router = {
		articles: {
			list: os
				.route({ method: "GET", path: "/api/articles" })
				.output(MultipleArticlesResponse)
				.handler(async (c) => {
					const articles = await ctx.repo.article.list();

					return { articles };
				}),
			create: os
				.route({
					method: "POST",
					path: "/api/articles",
					inputStructure: "detailed",
				})
				.input(
					StandardSchema(
						t.Object({
							body: CreateUpdateArticleRequestBody,
						}),
					),
				)
				.output(SingleArticleResponse)
				.handler(async (c) => {
					const article = createArticle(c.input.body.article, ctx);

					await ctx.repo.article.saveBySlug(article.slug, (old) => {
						if (old) {
							throw new ORPCError("CONFLICT", {
								message: `Article for article=${article.slug}`,
							});
						}
						return article;
					});

					return { article };
				}),
			getBySlug: os
				.route({ method: "GET", path: "/api/articles/{slug}" })
				.input(StandardSchema(t.Object({ slug: t.String() })))
				.output(SingleArticleResponse)
				.handler(async (c) => {
					const article = await ctx.repo.article.getBySlug(c.input.slug);

					if (article === undefined) {
						throw new ORPCError("NOT_FOUND", {
							message: `Article for slug=${c.input.slug}`,
						});
					}

					return { article };
				}),
			update: os
				.route({
					method: "PUT",
					path: "/api/articles/{slug}",
					inputStructure: "detailed",
				})
				.input(
					StandardSchema(
						t.Object({
							params: t.Object({
								slug: t.String(),
							}),
							body: CreateUpdateArticleRequestBody,
						}),
					),
				)
				.output(SingleArticleResponse)
				.handler(async (c) => {
					const result = await ctx.repo.article.saveBySlug(
						c.input.params.slug,
						(oldArticle) => {
							if (oldArticle === undefined) {
								throw new ORPCError("NOT_FOUND", {
									message: `Article for slug=${c.input.params.slug}`,
								});
							}

							return updateArticle(oldArticle, c.input.body.article, ctx);
						},
					);

					return { article: result };
				}),
			delete: os
				.route({ method: "DELETE", path: "/api/articles/{slug}" })
				.input(StandardSchema(t.Object({ slug: t.String() })))
				.handler(async (c) => {
					await ctx.repo.article.deleteBySlug(c.input.slug);
					return new Response("", { status: 204 });
				}),
			comments: {
				list: os
					.route({ method: "GET", path: "/api/articles/{slug}/comments" })
					.input(StandardSchema(t.Object({ slug: t.String() })))
					.output(MultipleCommentsResponse)
					.handler(async (c) => {
						const comments = await ctx.repo.comment.listByArticleSlug(
							c.input.slug,
						);
						return { comments };
					}),
				create: os
					.route({ method: "POST", path: "/api/articles/{slug}/comments" })
					.input(
						StandardSchema(
							t.Object({
								slug: t.String(),
								comment: t.Object({ body: t.String() }),
							}),
						),
					)
					.output(SingleCommentResponse)
					.handler(async (c) => {
						const comment = createComment(c.input.comment, ctx);

						await ctx.repo.comment.saveBySlugAndId(
							c.input.slug,
							comment.id,
							(_old) => comment,
						);

						return { comment };
					}),
				delete: os
					.route({
						method: "DELETE",
						path: "/api/articles/{slug}/comments/:id",
					})
					.input(StandardSchema(t.Object({ slug: t.String(), id: t.String() })))
					.handler(async (c) => {
						await ctx.repo.comment.deleteBySlugAndId(c.input.slug, c.input.id);
						return new Response("", { status: 204 });
					}),
			},
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
