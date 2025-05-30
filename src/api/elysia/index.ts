import { Elysia, status, t } from "elysia";
import { createFakeContext, type AppContext } from "../context";
import {
	CreateUpdateArticleRequestBody,
	MultipleArticlesResponse,
	SingleArticleResponse,
} from "../../schema/typebox/articles.ts";
import {
	CreateCommentRequestBody,
	MultipleCommentsResponse,
	SingleCommentResponse,
} from "../../schema/typebox/comments.ts";
import swagger from "@elysiajs/swagger";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import { NotExistError, AlreadyExistError } from "../../domain/errors";
import { createComment } from "../../domain/articles/comments/Comment";

export function createApp(ctx: AppContext) {
	const app = new Elysia()
		.error({
			AlreadyExistError,
			NotExistError,
		})
		.onError(({ code, error }) => {
			switch (code) {
				case "AlreadyExistError":
					return status("Conflict");
				case "NotExistError":
					return status("Not Found");
			}

			return new Response(String(error), {
				status: 500,
			});
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

				await ctx.repo.article.saveBySlug(article.slug, (old) => {
					if (old) {
						throw new AlreadyExistError(`Article for slug=${article}`);
					}

					return article;
				});

				return { article };
			},
			{
				body: CreateUpdateArticleRequestBody,
				response: SingleArticleResponse,
			},
		)
		.get(
			"/api/articles/:slug",
			async ({ params: { slug } }) => {
				const targetSlug = decodeURIComponent(slug);

				const article = await ctx.repo.article.getBySlug(targetSlug);

				if (article === undefined) {
					throw new NotExistError(`Article for slug=${targetSlug}`);
				}

				return { article };
			},
			{
				response: SingleArticleResponse,
				params: t.Object({ slug: t.String() }),
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
							throw new NotExistError(`NOT FOUND: ${request.url.toString()}`);
						}

						return updateArticle(oldArticle, body.article, ctx);
					},
				);

				return { article };
			},
			{
				body: CreateUpdateArticleRequestBody,
				response: SingleArticleResponse,
				params: t.Object({ slug: t.String() }),
			},
		)
		.delete(
			"/api/articles/:slug",
			async ({ params: { slug } }) => {
				const targetSlug = decodeURIComponent(slug);

				await ctx.repo.article.deleteBySlug(targetSlug);

				return new Response("", { status: 204 });
			},
			{
				params: t.Object({ slug: t.String() }),
			},
		)
		.get(
			"/api/articles/:slug/comments",
			async ({ params }) => {
				const targetSlug = decodeURIComponent(params.slug);

				const article = await ctx.repo.article.getBySlug(targetSlug);

				if (article === undefined) {
					throw new NotExistError(`Article for slug=${targetSlug}`);
				}

				const comments = await ctx.repo.comment.listByArticleSlug(targetSlug);

				return { comments };
			},
			{
				response: MultipleCommentsResponse,
				params: t.Object({ slug: t.String() }),
			},
		)
		.post(
			"/api/articles/:slug/comments",
			async ({ body, params }) => {
				const targetSlug = decodeURIComponent(params.slug);
				const comment = createComment(body.comment, ctx);

				await ctx.repo.comment.saveBySlugAndId(
					targetSlug,
					comment.id,
					(old) => {
						if (old) {
							throw new AlreadyExistError(`Comment for id=${comment.id}`);
						}

						return comment;
					},
				);

				return { comment };
			},
			{
				params: t.Object({ slug: t.String() }),
				body: CreateCommentRequestBody,
				response: SingleCommentResponse,
			},
		)
		.delete(
			"/api/articles/:slug/comments/:id",
			async ({ params: { slug, id } }) => {
				const targetSlug = decodeURIComponent(slug);

				const article = await ctx.repo.article.getBySlug(targetSlug);

				if (article === undefined) {
					throw new NotExistError(`Article for slug=${targetSlug}`);
				}

				await ctx.repo.comment.deleteBySlug(targetSlug, id);

				return new Response("", { status: 204 });
			},
			{
				params: t.Object({ slug: t.String(), id: t.String() }),
			},
		);

	return app;
}

export default createApp(createFakeContext({}))
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.get("/", () => "Hello Elysia")
	.get("/redoc", () =>
		Bun.file("./src/api/elysia/redoc.html")
			.text()
			.then(
				(html) =>
					new Response(html, {
						headers: {
							"Content-Type": "text/html",
						},
					}),
			),
	);
