import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type {
	FastifyBaseLogger,
	FastifyInstance,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
} from "fastify";
import type { AppContext } from "../context";
import {
	CreateUpdateArticleRequestBody,
	MultipleArticlesResponse,
	SingleArticleResponse,
} from "../../schema/typebox/articles";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import { t } from "elysia";
import { AlreadyExistError, NotExistError } from "../../domain/errors";

type FastifyTypebox = FastifyInstance<
	RawServerDefault,
	RawRequestDefaultExpression<RawServerDefault>,
	RawReplyDefaultExpression<RawServerDefault>,
	FastifyBaseLogger,
	TypeBoxTypeProvider
>;
export function registerArticles(ctx: AppContext) {
	return (fastify: FastifyTypebox, _options: unknown, done: () => void) => {
		fastify
			.get(
				"/",
				{
					schema: {
						response: {
							200: MultipleArticlesResponse,
						},
					},
				},
				async () => {
					const articles = await ctx.repo.article.list();
					return { articles };
				},
			)
			.post(
				"/",
				{
					schema: {
						body: CreateUpdateArticleRequestBody,
						response: {
							201: SingleArticleResponse,
							409: t.String(),
						},
					},
				},
				async (request, reply) => {
					const article = createArticle(request.body.article, ctx);

					await ctx.repo.article.saveBySlug(article.slug, (old) => {
						if (old) {
							throw new AlreadyExistError(article.slug);
						}

						return article;
					});

					return { article };
				},
			)
			.get(
				"/:slug",
				{
					schema: {
						params: t.Object({
							slug: t.String(),
						}),
						response: {
							200: SingleArticleResponse,
							404: t.String(),
						},
					},
				},
				async (request, reply) => {
					const slug = request.params.slug;
					const article = await ctx.repo.article.getBySlug(slug);

					if (article === undefined) {
						return reply.status(404).send("NOT_FOUND");
					}
					return { article };
				},
			)
			.put(
				"/:slug",
				{
					schema: {
						params: t.Object({
							slug: t.String(),
						}),
						body: CreateUpdateArticleRequestBody,
						response: {
							200: SingleArticleResponse,
							404: t.String(),
						},
					},
				},
				async (request, reply) => {
					const slug = request.params.slug;

					const result = await ctx.repo.article.saveBySlug(
						slug,
						(oldArticle) => {
							if (oldArticle === undefined) {
								throw new NotExistError("");
							}

							return updateArticle(oldArticle, request.body.article, ctx);
						},
					);

					return { article: result };
				},
			)
			.delete(
				"/:slug",
				{
					schema: {
						params: t.Object({
							slug: t.String(),
						}),
						response: {
							204: t.String(),
							404: t.String(),
						},
					},
				},
				async (request, reply) => {
					const slug = request.params.slug;

					await ctx.repo.article.deleteBySlug(slug);

					return "";
				},
			);

		done();
	};
}
