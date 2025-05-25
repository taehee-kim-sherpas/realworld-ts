import type { Article } from "../domain/articles/Article";
import type { ArticleRepo } from "./types";

function FakeArticleRepo(initState: Record<string, Article>): ArticleRepo {
	const state: Record<string, Article | undefined> = initState;

	return {
		async getBySlug(slug) {
			const article = state[slug];
			if (article === undefined) {
				return undefined;
			}
			return article;
		},
		async list() {
			return Object.values(state).filter((article) => article !== undefined);
		},
		async saveBySlug(slug, article) {
			delete state[slug];
			state[article.slug] = article;
		},
		async deleteBySlug(slug) {
			delete state[slug];
		},
	} satisfies ArticleRepo;
}

export default FakeArticleRepo;
