import type { Article } from "../domain/articles/Article";

export interface ArticleRepo {
	list(): Promise<Article[]>;
	getBySlug(slug: Article["slug"]): Promise<Article | undefined>;
	saveBySlug(slug: Article["slug"], article: Article): Promise<void>;
	deleteBySlug(slug: Article["slug"]): Promise<void>;
}
