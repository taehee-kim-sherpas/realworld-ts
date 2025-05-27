import express from "express";
import type { AppContext } from "../context";
import { validateRequest } from "./typebox-middleware";
import { createArticle, updateArticle } from "../../domain/articles/Article";
import { CreateUpdateArticleRequestBody } from "../../schema/typebox/articles";
import { t } from "elysia";

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
					res
						.status(409)
						.send(`CONFLICT: slug ${ctx.slugify(req.body.article.title)}`);
				}

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
						return "not-found";
					}

					return updateArticle(oldArticle, req.body.article, ctx);
				});

				if (result === "already-exist") {
					throw Error("NEVER");
				}

				if (result === "not-found") {
					res.status(404).send("NOT_FOUND");
					return;
				}
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

				const result = await ctx.repo.article.deleteBySlug(slug);

				if (result === "not-found") {
					res.status(404).send("NOT_FOUND");
					return;
				}
				res.status(204).send("");
			},
		);

	return app;
}
