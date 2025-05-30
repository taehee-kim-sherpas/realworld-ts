import type { Article } from "../domain/articles/Article";
import type { Comment } from "../domain/articles/comments/Comment";

export interface ArticleRepo {
	list(): Promise<Article[]>;
	getBySlug(slug: Article["slug"]): Promise<Article | undefined>;
	saveBySlug(
		slug: Article["slug"],
		update: (old: Article | undefined) => Article,
	): Promise<Article>;
	deleteBySlug(slug: Article["slug"]): Promise<void>;
}

export interface CommentRepo {
	listByArticleSlug(slug: string): Promise<Comment[]>;
	saveBySlugAndId(
		slug: string,
		id: Comment["id"],
		update: (old: Comment | undefined) => Comment,
	): Promise<Comment>;
	deleteBySlug(slug: string, id: Comment["id"]): Promise<undefined>;
}
