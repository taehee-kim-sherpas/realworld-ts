import type { GelJsDatabase } from "drizzle-orm/gel";
import * as gelSchema from "./gelSchema.ts";
import type { CommentRepo } from "../types";
import { eq, and } from "drizzle-orm";
import { NotExistError } from "../../domain/errors";

function toDomainComment<
	ResultT extends
		| {
				commentId: string;
				body: string;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined,
>(comment: ResultT) {
	if (comment === undefined) return undefined;
	return {
		id: comment.commentId,
		body: comment.body,
		createdAt: new Date(comment.createdAt),
		updatedAt: new Date(comment.updatedAt),
	};
}

export function createDrizzleGelCommentRepo(
	db: GelJsDatabase<typeof gelSchema>,
): CommentRepo {
	return {
		async listByArticleSlug(slug) {
			const article = await db.query.article.findFirst({
				with: {
					comments: {
						columns: {
							commentId: true,
							body: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
				where: eq(gelSchema.article.slug, slug),
			});
			return (
				article?.comments
					.map(toDomainComment)
					.filter((c): c is NonNullable<typeof c> => c !== undefined) ?? []
			);
		},
		async saveBySlugAndId(slug, id, update) {
			const article = await db.query.article.findFirst({
				where: eq(gelSchema.article.slug, slug),
			});
			if (!article) {
				throw new NotExistError("");
			}
			const old = await db.query.comment
				.findFirst({
					columns: {
						id: false,
					},
					where: and(
						eq(gelSchema.comment.articleId, article.id),
						eq(gelSchema.comment.commentId, id),
					),
				})
				.then(toDomainComment);
			const updated = update(old);
			if (old === undefined) {
				await db
					.insert(gelSchema.comment)
					.values({
						articleId: article.id,
						commentId: id,
						body: updated.body,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
					})
					.execute();
			} else {
				throw Error("Not Implemented");
			}
			return updated;
		},
		async deleteBySlugAndId(slug, id) {
			const old = await db.query.comment
				.findFirst({
					columns: {
						id: false,
					},
					where: eq(gelSchema.comment.commentId, id),
				})
				.then(toDomainComment);
			if (old) {
				await db
					.delete(gelSchema.comment)
					.where(eq(gelSchema.comment.commentId, id))
					.execute();
				return;
			}
			throw new NotExistError("");
		},
	} satisfies CommentRepo;
}
