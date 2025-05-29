import { integer, text, timestamp } from "drizzle-orm/pg-core/columns";
import { pgTable } from "drizzle-orm/pg-core/table";

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
