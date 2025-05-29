import { integer, text, timestamp } from "drizzle-orm/pg-core/columns";
import { pgTable } from "drizzle-orm/pg-core/table";
import { relations } from "drizzle-orm/relations";

export const articles = pgTable("articles", {
  slug: text("slug").primaryKey().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  body: text("body").notNull(),
  //   author: string;
  //   tagList: string;
  //   favorited: string;
  //   favoritesCount: string;
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});


export const comments = pgTable("comments", {
  id: text("id").primaryKey().unique(),
  body: text("body").notNull(),
  articleSlug: text("article_slug").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
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