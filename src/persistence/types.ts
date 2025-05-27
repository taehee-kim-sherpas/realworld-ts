import type { Article } from "../domain/articles/Article";

export interface ArticleRepo {
	list(): Promise<Article[]>;
	getBySlug(slug: Article["slug"]): Promise<Article | undefined>;
	saveBySlug(
		slug: Article["slug"],
		update: (
			old: Article | undefined,
		) => Article | "already-exist" | "not-found",
	): Promise<Article | "already-exist" | "not-found">;
	deleteBySlug(slug: Article["slug"]): Promise<"success" | "not-found">;
}
