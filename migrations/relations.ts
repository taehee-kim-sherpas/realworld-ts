import { relations } from "drizzle-orm/relations";
import { article, comment } from "./schema";

export const commentRelations = relations(comment, ({one}) => ({
	article: one(article, {
		fields: [comment.articleId],
		references: [article.id]
	}),
}));

export const articleRelations = relations(article, ({many}) => ({
	comments: many(comment),
}));