import type { CommentRepo } from "../types";
import type * as schema from "./kyselySchema";
import { NotExistError } from "../../domain/errors";
import type { Kysely } from "kysely";
import type { Comment } from "../../domain/articles/comments/Comment";

function toDomainModel(
	dbComment: schema.Comment | undefined,
): Comment | undefined {
	if (!dbComment) return undefined;
	return {
		id: dbComment.id,
		body: dbComment.body,
		createdAt: new Date(dbComment.createdAt as unknown as number),
		updatedAt: new Date(dbComment.updatedAt as unknown as number),
	};
}

function toDbModel(
	comment: Comment & { articleSlug: string },
): schema.NewComment {
	if (!comment) return comment;
	return {
		...comment,
		createdAt:
			comment.createdAt instanceof Date
				? comment.createdAt.getTime()
				: comment.createdAt,
		updatedAt:
			comment.updatedAt instanceof Date
				? comment.updatedAt.getTime()
				: comment.updatedAt,
	};
}

function createKyselyCommentRepo(db: Kysely<schema.Database>): CommentRepo {
	return {
		async listByArticleSlug(slug) {
			const dbComments = await db
				.selectFrom("comments")
				.selectAll()
				.where("articleSlug", "=", slug)
				.execute();
			return dbComments.map(toDomainModel) as Comment[];
		},
		async saveBySlugAndId(slug, id, update) {
			const dbComment = await db
				.selectFrom("comments")
				.selectAll()
				.where("articleSlug", "=", slug)
				.where("id", "=", id)
				.executeTakeFirst();
			const domainComment = toDomainModel(dbComment);
			const updated = update(domainComment);
			if (typeof updated === "string") return updated;
			const dbModel = toDbModel({ ...updated, articleSlug: slug });
			if (!dbComment) {
				await db
					.insertInto("comments")
					.values(dbModel as schema.NewComment)
					.execute();
			} else {
				throw Error("Not Implemented");
			}
			return updated;
		},
		async deleteBySlugAndId(slug, id) {
			const dbComment = await db
				.selectFrom("comments")
				.selectAll()
				.where("articleSlug", "=", slug)
				.where("id", "=", id)
				.executeTakeFirst();
			if (dbComment) {
				await db.deleteFrom("comments").where("id", "=", id).execute();
				return;
			}
			throw new NotExistError("");
		},
	};
}

export default createKyselyCommentRepo;
