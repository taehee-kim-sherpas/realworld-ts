import { os, ORPCError } from "@orpc/server";
import * as t from "@sinclair/typebox";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import {
	CreateUpdateArticleRequestBody,
	MultipleArticlesResponse,
	SingleArticleResponse,
} from "../../schema/typebox/articles";
import { StandardSchema } from "../../schema/typebox/standard";
import type { AppContext } from "../context";

export const createArticlesRoutes = (ctx: AppContext) => ({
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
});
