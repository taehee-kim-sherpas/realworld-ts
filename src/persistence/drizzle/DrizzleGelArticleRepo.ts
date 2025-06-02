import type { GelJsDatabase } from "drizzle-orm/gel";
import * as gelSchema from "./gelSchema.ts";
import type { ArticleRepo } from "../types";
import { eq } from "drizzle-orm";
import { NotExistError } from "../../domain/errors";

export function createDrizzleGelArticleRepo(
	db: GelJsDatabase<typeof gelSchema>,
): ArticleRepo {
	return {
		async getBySlug(slug) {
			return db.query.article.findFirst({
				columns: {
					id: false,
				},
				where: eq(gelSchema.article.slug, slug),
			});
		},
		async list() {
			const results = await db.query.article.findMany({
				columns: {
					id: false,
				},
			});
			return results.filter((a): a is NonNullable<typeof a> => a !== undefined);
		},
		async saveBySlug(slug, update) {
			const old = await db.query.article.findFirst({
				columns: {
					id: false,
				},
				where: eq(gelSchema.article.slug, slug),
			});
			const updated = update(old);
			if (typeof updated === "string") return updated;
			if (old === undefined) {
				await db
					.insert(gelSchema.article)
					.values({
						title: updated.title,
						slug: updated.slug,
						description: updated.description,
						body: updated.body,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
					})
					.execute();
			} else {
				await db
					.update(gelSchema.article)
					.set({
						title: updated.title,
						slug: updated.slug,
						description: updated.description,
						body: updated.body,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
					})
					.where(eq(gelSchema.article.slug, old.slug))
					.execute();
			}
			return updated;
		},
		async deleteBySlug(slug) {
			const old = await db.query.article.findFirst({
				where: eq(gelSchema.article.slug, slug),
			});
			if (old) {
				await db
					.delete(gelSchema.article)
					.where(eq(gelSchema.article.slug, slug))
					.execute();
				return;
			}
			throw new NotExistError(`Article for slug=${slug}`);
		},
	} satisfies ArticleRepo;
}

export default createDrizzleGelArticleRepo;
