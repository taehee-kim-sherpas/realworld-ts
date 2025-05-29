import { eq } from "drizzle-orm/sql/expressions";

import { sql } from "drizzle-orm";
import type { ArticleRepo } from "../types.ts";
import * as pgSchema from "./pgSchema.ts";
import type { PgQueryResultHKT } from "drizzle-orm/pg-core/session";
import type { PgDatabase } from "drizzle-orm/pg-core/db";
import { NotExistError } from "../../domain/errors.ts";

export function createDrizzlePgArticleRepo(
	db: PgDatabase<PgQueryResultHKT, typeof pgSchema>,
): ArticleRepo {
	const preparedAll = db.query.articles
		.findMany({})
		.prepare("get_articles_list");

	const preparedGet = db.query.articles
		.findFirst({
			where: eq(pgSchema.articles.slug, sql.placeholder("targetSlug")),
		})
		.prepare("get_article_by_slug");

	return {
		async getBySlug(slug) {
			return preparedGet.execute({ targetSlug: slug });
		},
		async list() {
			return preparedAll.execute();
		},
		async saveBySlug(slug, update) {
			const old = await preparedGet.execute({ targetSlug: slug });

			const updated = update(old);

			if (typeof updated === "string") {
				return updated;
			}

			if (old === undefined) {
				await db
					.insert(pgSchema.articles)
					.values({
						title: updated.title,
						slug: updated.slug,
						description: updated.description,
						body: updated.body,
						//   author: updated.//   author,
						//   tagList: updated.//   tagList,
						//   favorited: updated.//   favorited,
						//   favoritesCount: updated.//   favoritesCount,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
					})
					.execute();
			} else {
				await db
					.update(pgSchema.articles)
					.set({
						title: updated.title,
						slug: updated.slug,
						description: updated.description,
						body: updated.body,
						//   author: updated.//   author,
						//   tagList: updated.//   tagList,
						//   favorited: updated.//   favorited,
						//   favoritesCount: updated.//   favoritesCount,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
					})
					.where(eq(pgSchema.articles.slug, old.slug))
					.execute();
			}

			return updated;
		},
		async deleteBySlug(slug) {
			const old = await preparedGet.execute({ targetSlug: slug });
			if (old) {
				await db
					.delete(pgSchema.articles)
					.where(eq(pgSchema.articles.slug, slug))
					.execute();
				return;
			}

			throw new NotExistError(`Article for slug=${slug}`);
		},
	} satisfies ArticleRepo;
}

export default createDrizzlePgArticleRepo;
