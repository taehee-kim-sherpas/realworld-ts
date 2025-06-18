import { os } from "@orpc/server";
import * as t from "@sinclair/typebox";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import {
	Article,
	CreateUpdateArticleRequestBody,
	MultipleArticlesResponse,
	SingleArticleResponse,
} from "../../schema/typebox/articles";
import { StandardDecodeSchema } from "../../schema/typebox/standard";
import type { AppContext } from "../context";
import { AlreadyExistError, NotExistError } from "../../domain/errors";

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
		})
		.input(StandardDecodeSchema(CreateUpdateArticleRequestBody))
		.output(SingleArticleResponse)
		.handler(async (c) => {
			const article = createArticle(c.input.article, ctx);

			await ctx.repo.article.saveBySlug(article.slug, (old) => {
				if (old) {
					throw new AlreadyExistError("Article for article=${article.slug}");
				}
				return article;
			});

			return { article };
		}),
	getBySlug: os
		.route({ method: "GET", path: "/api/articles/{slug}" })
		.input(StandardDecodeSchema(t.Object({ slug: t.String() })))
		.output(SingleArticleResponse)
		.handler(async (c) => {
			const article = await ctx.repo.article.getBySlug(c.input.slug);

			if (article === undefined) {
				throw new NotExistError(`Article for slug=${c.input.slug}`);
			}

			return { article };
		}),
	update: os
		.route({
			method: "PUT",
			path: "/api/articles/{slug}",
		})
		.input(
			StandardDecodeSchema(
				t.Object({
					article: t.Pick(Article, ["title", "description", "body"]),
					slug: t.String(),
				}),
			),
		)
		.output(SingleArticleResponse)
		.handler(async (c) => {
			const result = await ctx.repo.article.saveBySlug(
				c.input.slug,
				(oldArticle) => {
					if (oldArticle === undefined) {
						throw new NotExistError(`Article for slug=${c.input.slug}`);
					}

					return updateArticle(oldArticle, c.input.article, ctx);
				},
			);

			return { article: result };
		}),
	delete: os
		.route({ method: "DELETE", path: "/api/articles/{slug}" })
		.input(StandardDecodeSchema(t.Object({ slug: t.String() })))
		.handler(async (c) => {
			await ctx.repo.article.deleteBySlug(c.input.slug);
			return new Response("", { status: 204 });
		}),
});
