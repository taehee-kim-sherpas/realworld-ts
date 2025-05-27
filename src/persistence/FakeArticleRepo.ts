import type { Article } from "../domain/articles/Article";
import type { ArticleRepo } from "./types";

function createFakeArticleRepo(
	initState: Record<string, Article>,
): ArticleRepo {
	const state: Record<string, Article | undefined> = initState;

	return {
		async getBySlug(slug) {
			return state[slug];
		},
		async list() {
			return Object.values(state).filter((article) => article !== undefined);
		},
		async saveBySlug(slug, update) {
			const old = state[slug];

			const updated = update(old);

			if (typeof updated === "string") {
				return updated;
			}

			delete state[slug];
			state[updated.slug] = updated;
			return updated;
		},
		async deleteBySlug(slug) {
			if (state[slug]) {
				delete state[slug];
				return "success";
			}
			return "not-found";
		},
	} satisfies ArticleRepo;
}

export default createFakeArticleRepo;
