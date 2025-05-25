import { Hono } from "hono";
import * as v from "valibot";
import { prettyJSON } from "hono/pretty-json";
import slugify from "cjk-slug";
import { simpleRoute } from "./openapiUtils";
import { describeRoute, openAPISpecs } from "hono-openapi";
import FakeArticleRepo from "../../persistence/FakeArticleRepo";
import {
	multipleArticlesResponseDto,
	singleArticleResponseDto,
	updateNewArticleRequestDto,
} from "../../schema/valibot/articlesDto";
import { vValidator } from "@hono/valibot-validator";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import type { AppContext } from "../context";

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
			vValidator("json", updateNewArticleRequestDto),
			async (c) => {
				const reqDto = c.req.valid("json");

				const article = createArticle(reqDto.article, ctx);

				await ctx.repo.article.saveBySlug(article.slug, article);

				return c.json({ article });
			},
		)
		.put(
			"/api/articles/:slug",
			simpleRoute({
				res: singleArticleResponseDto,
			}),
			vValidator("param", v.object({ slug: v.string() })),
			vValidator("json", updateNewArticleRequestDto),
			async (c) => {
				const { slug } = c.req.valid("param");
				const reqDto = c.req.valid("json");

				const oldArticle = await ctx.repo.article.getBySlug(slug);

				if (oldArticle === undefined) {
					return new Response(`NOT FOUND: ${c.req.url.toString()}`, {
						status: 404,
					});
				}

				const article = updateArticle(oldArticle, reqDto.article, ctx);

				await ctx.repo.article.saveBySlug(oldArticle.slug, article);

				return c.json({ article });
			},
		)
		.get(
			"/api/articles/:slug",
			simpleRoute({
				res: singleArticleResponseDto,
			}),
			vValidator("param", v.object({ slug: v.string() })),
			async (c) => {
				const { slug } = c.req.valid("param");

				const article = await ctx.repo.article.getBySlug(slug);

				if (article === undefined) {
					return new Response(`NOT FOUND: ${c.req.url.toString()}`, {
						status: 404,
					});
				}

				return c.json({ article });
			},
		)
		.delete(
			"/api/articles/:slug",
			vValidator("param", v.object({ slug: v.string() })),
			async (c) => {
				const { slug } = c.req.valid("param");

				const oldArticle = await ctx.repo.article.getBySlug(slug);

				if (oldArticle === undefined) {
					return new Response(`NOT FOUND: ${c.req.url.toString()}`, {
						status: 404,
					});
				}

				await ctx.repo.article.deleteBySlug(oldArticle.slug);

				return new Response("", {
					status: 204,
				});
			},
		)
		.notFound(async (c) => {
			return new Response(`NOT FOUND: ${c.req.url.toString()}`, {
				status: 404,
			});
		})
		.onError((error, c) => {
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
		article: FakeArticleRepo({}),
	},
	slugify,
});
