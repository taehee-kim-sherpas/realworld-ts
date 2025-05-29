import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import type { AppContext } from "../context";
import { validateRequest } from "./typebox-middleware";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import { CreateUpdateArticleRequestBody } from "../../schema/typebox/articles";
import { t } from "elysia";
import { AlreadyExistError, NotExistError } from "../../domain/errors";
import { CreateCommentRequestBody } from "../../schema/typebox/comments";
import { createComment } from "../../domain/articles/comments/Comment";

export function createServer(ctx: AppContext) {
	const app = express()
		.use(express.json())
		.get("/api/articles", async (req, res) => {
			const articles = await ctx.repo.article.list();
			res.json({ articles });
		})
		.post(
			"/api/articles",
			validateRequest({
				body: CreateUpdateArticleRequestBody,
			}),
			async (req, res) => {
				const article = createArticle(req.body.article, ctx);

				await ctx.repo.article.saveBySlug(article.slug, (old) => {
					if (old) {
						throw new AlreadyExistError("");
					}

					return article;
				});

				res.json({ article });
			},
		)
		.get(
			"/api/articles/:slug",
			validateRequest({
				params: t.Object({ slug: t.String() }),
			}),
			async (req, res) => {
				const slug = req.params.slug;
				const article = await ctx.repo.article.getBySlug(slug);

				if (article === undefined) {
					res.status(404).send("NOT_FOUND");
					return;
				}
				res.json({ article });
			},
		)
		.put(
			"/api/articles/:slug",
			validateRequest({
				params: t.Object({ slug: t.String() }),
				body: CreateUpdateArticleRequestBody,
			}),
			async (req, res) => {
				const slug = req.params.slug;

				const result = await ctx.repo.article.saveBySlug(slug, (oldArticle) => {
					if (oldArticle === undefined) {
						throw new NotExistError("");
					}

					return updateArticle(oldArticle, req.body.article, ctx);
				});

				res.json({ article: result });
				return;
			},
		)
		.delete(
			"/api/articles/:slug",
			validateRequest({
				params: t.Object({ slug: t.String() }),
			}),
			async (req, res) => {
				const slug = req.params.slug;

				await ctx.repo.article.deleteBySlug(slug);

				res.status(204).send("");
			},
		)
		.get("/api/articles/:slug/comments", async (req, res) => {
			const comments = await ctx.repo.comment.listByArticleSlug(
				req.params.slug,
			);
			res.json({ comments });
		})
		.post(
			"/api/articles/:slug/comments",
			validateRequest({
				params: t.Object({ slug: t.String() }),
				body: CreateCommentRequestBody,
			}),
			async (req, res) => {
				const comment = createComment(req.body.comment, ctx);

				await ctx.repo.comment.saveBySlugAndId(
					req.params.slug,
					comment.id,
					(old) => {
						if (old) {
							throw new AlreadyExistError("");
						}

						return comment;
					},
				);

				res.json({ comment });
			},
		)
		.delete(
			"/api/articles/:slug/comments/:id",
			validateRequest({
				params: t.Object({ slug: t.String(), id: t.String() }),
			}),
			async (req, res) => {
				const { slug, id } = req.params;

				await ctx.repo.comment.deleteBySlug(slug, id);

				res.status(204).send("");
			},
		);

	app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
		if (error instanceof NotExistError) {
			res.status(404).send("NOT_FOUND");
			return;
		}
		if (error instanceof AlreadyExistError) {
			res.status(409).send("ALREADY_EXIST");
			return;
		}

		next();
	});

	return app;
}
