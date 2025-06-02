import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export interface ArticleTable {
	slug: string;
	title: string;
	description: string;
	body: string;
	createdAt: ColumnType<number, number | undefined, never>;
	updatedAt: ColumnType<number, number | undefined, never>;
}

export type Article = Selectable<ArticleTable>;
export type NewArticle = Insertable<ArticleTable>;
export type ArticleUpdate = Updateable<ArticleTable>;

export interface CommentTable {
	id: string;
	body: string;
	articleSlug: string;
	createdAt: ColumnType<number, number | undefined, never>;
	updatedAt: ColumnType<number, number | undefined, never>;
}

export type Comment = Selectable<CommentTable>;
export type NewComment = Insertable<CommentTable>;
export type CommentUpdate = Updateable<CommentTable>;

export interface Database {
	articles: ArticleTable;
	comments: CommentTable;
}
