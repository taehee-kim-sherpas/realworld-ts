import { and, eq } from "drizzle-orm/sql/expressions";

import { sql } from "drizzle-orm";
import type { CommentRepo } from "../types.ts";
import * as schema from "./sqliteSchema.ts";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core/db";
import { NotExistError } from "../../domain/errors.ts";

function createDrizzleSqliteCommentRepo(
	db: BaseSQLiteDatabase<"sync" | "async", void, typeof schema>,
): CommentRepo {
	const preparedAll = db.query.comments
		.findMany({
			columns: {
				articleSlug: false,
			},
			where: eq(schema.comments.articleSlug, sql.placeholder("targetSlug")),
		})
		.prepare();

	const preparedGet = db.query.comments
		.findFirst({
			columns: {
				articleSlug: false,
			},
			where: and(
				eq(schema.comments.articleSlug, sql.placeholder("targetSlug")),
				eq(schema.comments.id, sql.placeholder("commentId")),
			),
		})
		.prepare();

	return {
		async listByArticleSlug(slug) {
			const result = await preparedAll.all({ targetSlug: slug });
			return result.map((item) => {
				return item;
			});
		},
		async saveBySlugAndId(slug, id, update) {
			const old = await preparedGet.get({ targetSlug: slug, commentId: id });

			const updated = update(old);

			if (typeof updated === "string") {
				return updated;
			}

			if (old === undefined) {
				await db
					.insert(schema.comments)
					.values({
						articleSlug: slug,
						...updated,
					})
					.execute();
			} else {
				throw Error("Not Implemented");
			}

			return updated;
		},
		async deleteBySlug(slug, id) {
			const old = await preparedGet.get({ targetSlug: slug, commentId: id });

			if (old) {
				await db
					.delete(schema.comments)
					.where(eq(schema.comments.id, id))
					.execute();
				return;
			}

			throw new NotExistError("");
		},
	} satisfies CommentRepo;
}

export default createDrizzleSqliteCommentRepo;
