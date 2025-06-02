import { gelTable, uniqueIndex, foreignKey, uuid, text, timestamptz } from "drizzle-orm/gel-core"
import { sql } from "drizzle-orm"


export const comment = gelTable("comment", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	articleId: uuid("article_id").notNull(),
	body: text().notNull(),
	commentId: text().notNull(),
	createdAt: timestamptz().notNull(),
	updatedAt: timestamptz().notNull(),
}, (table) => [
	uniqueIndex("70de088c-3f54-11f0-a400-455af460192a;schemaconstr").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [article.id],
			name: "comment_fk_article"
		}),
]);

export const article = gelTable("article", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	body: text().notNull(),
	createdAt: timestamptz().notNull(),
	description: text().notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	updatedAt: timestamptz().notNull(),
}, (table) => [
	uniqueIndex("70dc2b16-3f54-11f0-928f-171a8c90eabc;schemaconstr").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
]);
