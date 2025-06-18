import { Hono, type ValidationTargets } from "hono";
import * as v from "valibot";
import { prettyJSON } from "hono/pretty-json";
import slugify from "cjk-slug";
import { simpleRoute } from "./openapiUtils";
import { describeRoute, openAPISpecs } from "hono-openapi";
import createFakeArticleRepo from "../../persistence/FakeArticleRepo";
import {
	multipleArticlesResponseDto,
	singleArticleResponseDto,
	updateNewArticleRequestDto,
} from "../../schema/valibot/articlesDto";
import { vValidator } from "@hono/valibot-validator";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import type { AppContext } from "../context";
import createFakeCommentRepo from "../../persistence/FakeCommentRepo";
import { createComment } from "../../domain/articles/comments/Comment";
import { AlreadyExistError, NotExistError } from "../../domain/errors";
import {
	multipleCommentsResponseDto,
	newCommentRequestDto,
	singleCommentResponseDto,
} from "../../schema/valibot/commentsDto";
import type { BaseIssue, GenericSchema, GenericSchemaAsync } from "valibot";

function validator<
	T extends
		| GenericSchema<unknown, unknown, BaseIssue<unknown>>
		| GenericSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	Target extends keyof ValidationTargets,
>(key: Target, schema: T) {
	return vValidator(key, schema, (result, c) => {
		if (result.success === false) {
			c.status(422);
			return c.json({
				statusCode: 422,
				timestamp: new Date().toISOString(),
				path: c.req.url.toString(),
				message: result.issues,
			});
		}
	});
}

export function createApp(ctx: AppContext) {
	const app = new Hono()
		// .use('*', logger())
		.get(
			"/api/articles",
			simpleRoute({
				res: multipleArticlesResponseDto,
			}),
			async (c) => {
				const articles = await ctx.repo.article.list();
				return c.json({ articles });
			},
		)
		.post(
			"/api/articles",
			simpleRoute({
				res: singleArticleResponseDto,
			}),
			validator("json", updateNewArticleRequestDto),
			async (c) => {
				const reqDto = c.req.valid("json");

				const article = createArticle(reqDto.article, ctx);

				await ctx.repo.article.saveBySlug(article.slug, (old) => {
					if (old) {
						throw new AlreadyExistError(`Article for article=${article.slug}`);
					}

					return article;
				});

				return c.json({ article });
			},
		)
		.put(
			"/api/articles/:slug",
			simpleRoute({
				res: singleArticleResponseDto,
			}),
			validator("param", v.object({ slug: v.string() })),
			validator("json", updateNewArticleRequestDto),
			async (c) => {
				const { slug } = c.req.valid("param");
				const reqDto = c.req.valid("json");

				const result = await ctx.repo.article.saveBySlug(slug, (oldArticle) => {
					if (oldArticle === undefined) {
						throw new NotExistError(`Article for slug=${slug}`);
					}

					return updateArticle(oldArticle, reqDto.article, ctx);
				});

				return c.json({ article: result });
			},
		)
		.get(
			"/api/articles/:slug",
			simpleRoute({
				res: singleArticleResponseDto,
			}),
			validator("param", v.object({ slug: v.string() })),
			async (c) => {
				const { slug } = c.req.valid("param");

				const article = await ctx.repo.article.getBySlug(slug);

				if (article === undefined) {
					throw new NotExistError(`Article for slug=${slug}`);
				}

				return c.json({ article });
			},
		)
		.delete(
			"/api/articles/:slug",
			validator("param", v.object({ slug: v.string() })),
			async (c) => {
				const { slug } = c.req.valid("param");

				await ctx.repo.article.deleteBySlug(slug);

				return new Response("", {
					status: 204,
				});
			},
		)
		.get(
			"/api/articles/:slug/comments",
			simpleRoute({
				res: multipleCommentsResponseDto,
			}),
			validator("param", v.object({ slug: v.string() })),
			async (c) => {
				const { slug } = c.req.valid("param");

				const comments = await ctx.repo.comment.listByArticleSlug(slug);

				return c.json({ comments });
			},
		)
		.post(
			"/api/articles/:slug/comments",
			simpleRoute({
				res: singleCommentResponseDto,
			}),
			validator("param", v.object({ slug: v.string() })),
			validator("json", newCommentRequestDto),
			async (c) => {
				const { slug } = c.req.valid("param");
				const dto = c.req.valid("json");

				const comment = createComment(dto.comment, ctx);

				await ctx.repo.comment.saveBySlugAndId(
					slug,
					comment.id,
					(_old) => comment,
				);

				return c.json({ comment });
			},
		)
		.delete(
			"/api/articles/:slug/comments/:id",
			validator("param", v.object({ slug: v.string(), id: v.string() })),
			async (c) => {
				const { id, slug } = c.req.valid("param");

				await ctx.repo.comment.deleteBySlugAndId(slug, id);

				return new Response("", {
					status: 204,
				});
			},
		);

	app.notFound(async (c) => {
		return new Response(`NOT_FOUND: ${c.req.url.toString()}`, {
			status: 404,
		});
	});

	app.onError((error, c) => {
		if (error instanceof NotExistError) {
			return new Response(`NOT_EXIST: ${c.req.url.toString()}`, {
				status: 404,
			});
		}
		if (error instanceof AlreadyExistError) {
			return new Response(`ALREADY_EXIST: ${c.req.url.toString()}`, {
				status: 409,
			});
		}
		if (error instanceof Error) {
			return new Response(error.message, {
				status: 500,
			});
		}

		return new Response(String(error), {
			status: 500,
		});
	});

	app.get(
		"/openapi.json",
		openAPISpecs(app, {
			documentation: {
				info: {
					title: "Cosmic Js API",
					version: "1.0.0",
					description: "재고 관리 시스템",
				},
				servers: [
					{ url: "http://localhost:3000", description: "Local Server" },
				],
			},
		}),
	);

	app.get(
		"/redoc",
		describeRoute({
			responses: {
				200: {
					content: {
						"text/html": {
							schema: v.string(),
						},
					},
					description: "redoc.html",
				},
			},
		}),
		async (c) => {
			return await Bun.file("./redoc.html").text().then(c.html);
		},
	);

	app.use("/openapi.json/*", prettyJSON());

	return app;
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
