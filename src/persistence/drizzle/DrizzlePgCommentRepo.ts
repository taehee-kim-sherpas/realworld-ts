import type { PgDatabase } from "drizzle-orm/pg-core/db";
import { sql } from "drizzle-orm";
import { and, eq } from "drizzle-orm/sql/expressions";
import type { PgQueryResultHKT } from "drizzle-orm/pg-core/session";
import type { CommentRepo } from "../types.ts";
import { NotExistError } from "../../domain/errors.ts";
import * as pgSchema from "./pgSchema.ts";

export function createDrizzlePgCommentRepo(
	db: PgDatabase<PgQueryResultHKT, typeof pgSchema>,
): CommentRepo {
	const preparedAll = db.query.comments
		.findMany({
			columns: {
				articleSlug: false,
			},
			where: eq(pgSchema.comments.articleSlug, sql.placeholder("targetSlug")),
		})
		.prepare("get_articles_comment_list");

	const preparedGet = db.query.comments
		.findFirst({
			columns: {
				articleSlug: false,
			},
			where: and(
				eq(pgSchema.comments.articleSlug, sql.placeholder("targetSlug")),
				eq(pgSchema.comments.id, sql.placeholder("commentId")),
			),
		})
		.prepare("get_articles_comment");

	return {
		async listByArticleSlug(slug) {
			return preparedAll.execute({ targetSlug: slug });
		},
		async saveBySlugAndId(slug, id, update) {
			const old = await preparedGet.execute({
				targetSlug: slug,
				commentId: id,
			});

			const updated = update(old);

			if (old === undefined) {
				await db
					.insert(pgSchema.comments)
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
			const old = await preparedGet.execute({
				targetSlug: slug,
				commentId: id,
			});

			if (old) {
				await db
					.delete(pgSchema.comments)
					.where(eq(pgSchema.comments.id, id))
					.execute();
				return;
			}

			throw new NotExistError("");
		},
	} satisfies CommentRepo;
}

export default createDrizzlePgCommentRepo;
