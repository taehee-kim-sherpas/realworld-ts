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
						return reply
							.code(409)
							.send(
								`CONFLICT: slug ${ctx.slugify(request.body.article.title)}`,
							);
					}

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
								return "not-found";
							}

							return updateArticle(oldArticle, request.body.article, ctx);
						},
					);

					if (result === "already-exist") {
						throw Error("NEVER");
					}

					if (result === "not-found") {
						return reply.status(404).send("NOT_FOUND");
					}
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

					const result = await ctx.repo.article.deleteBySlug(slug);

					if (result === "not-found") {
						return reply.status(404).send("NOT_FOUND");
					}
					return "";
				},
			);

		done();
	};
}
