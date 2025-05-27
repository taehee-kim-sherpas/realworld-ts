import { Elysia, InternalServerError, NotFoundError, t } from "elysia";
import type { AppContext } from "../context";
import {
	CreateUpdateArticleRequestBody,
	MultipleArticlesResponse,
	SingleArticleResponse,
} from "../../schema/typebox/articles";
import { createArticle, updateArticle } from "../../domain/articles/Article";

class AlreadyExistError extends Error {
	constructor(public message: string) {
		super(message);
	}
}

export function createApp(ctx: AppContext) {
	const app = new Elysia()
		.error({
			AlreadyExistError,
		})
		.onError(({ code, error }) => {
			switch (code) {
				case "AlreadyExistError":
					return new Response(`CONFLICT: ${error.message}`, {
						status: 409,
					});
			}
		})
		.get(
			"/api/articles",
			async () => {
				const articles = await ctx.repo.article.list();
				return { articles };
			},
			{
				response: MultipleArticlesResponse,
			},
		)
		.post(
			"/api/articles",
			async ({ body }) => {
				const article = createArticle(body.article, ctx);

				const result = await ctx.repo.article.saveBySlug(
					article.slug,
					(old) => {
						if (old) {
							return "already-exist";
						}

						return article;
					},
				);

				if (result === "already-exist") {
					throw new AlreadyExistError(
						`slug ${ctx.slugify(body.article.title)} Article이 이미 존재합니다`,
					);
				}

				return { article };
			},
			{
				body: CreateUpdateArticleRequestBody,
				response: SingleArticleResponse,
			},
		)
		.get(
			"/api/articles/:slug",
			async ({ params: { slug }, request }) => {
				const targetSlug = decodeURIComponent(slug);

				const article = await ctx.repo.article.getBySlug(targetSlug);
				if (article === undefined) {
					throw new NotFoundError(`NOT FOUND: ${request.url.toString()}`);
				}

				return { article };
			},
			{
				response: SingleArticleResponse,
			},
		)
		.put(
			"/api/articles/:slug",
			async ({ params: { slug }, body, request }) => {
				const targetSlug = decodeURIComponent(slug);

				const article = await ctx.repo.article.saveBySlug(
					targetSlug,
					(oldArticle) => {
						if (oldArticle === undefined) {
							return "not-found";
						}

						return updateArticle(oldArticle, body.article, ctx);
					},
				);

				if (article === "already-exist") {
					throw new InternalServerError();
				}

				if (article === "not-found") {
					throw new NotFoundError(`NOT FOUND: ${request.url.toString()}`);
				}

				return { article };
			},
			{
				body: CreateUpdateArticleRequestBody,
				response: SingleArticleResponse,
			},
		)
		.delete(
			"/api/articles/:slug",
			async ({ params: { slug }, body, request }) => {
				const targetSlug = decodeURIComponent(slug);

				const result = await ctx.repo.article.deleteBySlug(targetSlug);

				if (result === "not-found") {
					throw new NotFoundError(`NOT FOUND: ${request.url.toString()}`);
				}

				return new Response("", { status: 204 });
			},
			{},
		);

	return app;
}
