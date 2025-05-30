import { relations } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core/columns";
import { sqliteTable } from "drizzle-orm/sqlite-core/table";

export const articles = sqliteTable("articles", {
	slug: text("slug").primaryKey().unique(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	body: text("body").notNull(),
	//   author: string;
	//   tagList: string;
	//   favorited: string;
	//   favoritesCount: string;
	createdAt: integer("createdAt", {
		mode: "timestamp",
	}).notNull(),
	updatedAt: integer("updatedAt", {
		mode: "timestamp",
	}).notNull(),
});

export const comments = sqliteTable("comments", {
	id: text("id").primaryKey().unique(),
	body: text("body").notNull(),
	articleSlug: text("article_slug").notNull(),
	createdAt: integer("createdAt", {
		mode: "timestamp",
	}).notNull(),
	updatedAt: integer("updatedAt", {
		mode: "timestamp",
	}).notNull(),
});

export const articleComments = relations(articles, ({ many }) => ({
	comments: many(comments),
}));

export const commentParent = relations(comments, ({ one }) => ({
	parent: one(articles, {
		fields: [comments.articleSlug],
		references: [articles.slug],
	}),
}));
