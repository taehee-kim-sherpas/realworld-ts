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
