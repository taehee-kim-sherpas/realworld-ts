import { eq } from "drizzle-orm/sql/expressions";

import { sql } from "drizzle-orm";
import type { ArticleRepo } from "../types";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.ts";

function createDrizzleSqliteArticleRepo(
	db: BunSQLiteDatabase<typeof schema>,
): ArticleRepo {
	const preparedAll = db.query.articles
		.findMany({
			with: {},
		})
		.prepare();
	const preparedGet = db.query.articles
		.findFirst({
			with: {},
			where: eq(schema.articles.slug, sql.placeholder("targetSlug")),
		})
		.prepare();

	return {
		async getBySlug(slug) {
			const article = preparedGet.get({ targetSlug: slug });
			if (article === undefined) {
				return undefined;
			}
			return article;
		},
		async list() {
			const result = preparedAll.all();

			return result;
		},
		async saveBySlug(slug, update) {
			const old = preparedGet.get({ targetSlug: slug });

			const updated = update(old);

			if (typeof updated === "string") {
				return updated;
			}

			if (old === undefined) {
				db.insert(schema.articles)
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
				db.update(schema.articles)
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
					.where(eq(schema.articles.slug, old.slug))
					.execute();
			}

			return updated;
		},
		async deleteBySlug(slug) {
			db.delete(schema.articles)
				.where(eq(schema.articles.slug, slug))
				.execute();
		},
	} satisfies ArticleRepo;
}

export default createDrizzleSqliteArticleRepo;
