import type { Article } from "../domain/articles/Article";
import type { Comment } from "../domain/articles/comments/Comment";
import { NotExistError } from "../domain/errors";
import type { CommentRepo } from "./types";

function createFakeCommentRepo(
	initState: Record<Article["slug"], Comment[]>,
): CommentRepo {
	const state: Record<Article["slug"], Comment[] | undefined> = initState;

	return {
		async listByArticleSlug(slug) {
			return state[slug] ?? [];
		},
		async saveBySlugAndId(slug, id, update) {
			const comments = state[slug] ?? [];

			const oldIndex = comments.findIndex((item) => item.id === id);

			let comment = update(undefined);
			if (oldIndex === -1) {
				state[slug] = [...(comments ?? []), comment];
			} else {
				comment = update(comments[oldIndex]);
				const result = [...comments];
				result[oldIndex] = comment;
				state[slug] = result;
			}
			return comment;
		},
		async deleteBySlugAndId(
			slug: string,
			id: Comment["id"],
		): Promise<undefined> {
			const comments = state[slug] ?? [];

			state[slug] = comments.filter((item) => item.id !== id);
		},
	} satisfies CommentRepo;
}

export default createFakeCommentRepo;
