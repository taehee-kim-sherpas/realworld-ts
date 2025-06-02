import "reflect-metadata";
import Database from "bun:sqlite";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite/driver";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as sqliteSchema from "../persistence/drizzle/sqliteSchema.ts";
import * as pgSchema from "../persistence/drizzle/pgSchema.ts";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core/db";
import { drizzle as drizzleGel } from "drizzle-orm/gel";
import { createClient } from "gel";
import * as gelSchema from "../persistence/drizzle/gelSchema.ts";
import { Kysely } from "kysely";
import type { Database as KyselyDatabase } from "../persistence/drizzle/kyselySchema";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { DataSource } from "typeorm";
import { ArticleEntity } from "../persistence/typeorm/ArticleEntity";
import { CommentEntity } from "../persistence/typeorm/CommentEntity";
import { ANOTHER_ARTICLE, TEST_ARTICLE } from "../domain/fixtures.ts";
import { eq } from "drizzle-orm";

export function setupMemoryDb(_key: string): {
	db: BaseSQLiteDatabase<"sync", void, typeof sqliteSchema>;
	destroy: () => Promise<void>;
} {
	// const sqlite = new Database("test-" + key + ".db");
	const sqlite = new Database(":memory:");

	const db = drizzleSqlite(sqlite, {
		schema: sqliteSchema,
	});

	try {
		db.run(`
    CREATE TABLE "articles" (
			"slug" text PRIMARY KEY NOT NULL,
			"title" text NOT NULL,
			"description" text NOT NULL,
			"body" text NOT NULL,
			"createdAt" integer NOT NULL,
			"updatedAt" integer NOT NULL
		);`);
		db.run(`
    CREATE TABLE "comments" (
			"id" text PRIMARY KEY NOT NULL,
			"article_slug" text NOT NULL,
			"body" text NOT NULL,
			"createdAt" integer NOT NULL,
			"updatedAt" integer NOT NULL
		);`);
	} catch (e) {}
	return {
		db,
		async destroy() {
			sqlite.close();
		},
	};
}

export function setupPgliteDb(): {
	db: PgDatabase<PgQueryResultHKT, typeof pgSchema>;
	setup: () => Promise<void>;
	destroy: () => Promise<void>;
} {
	const client = new PGlite();

	const db = drizzlePglite(client, {
		schema: pgSchema,
	});
	return {
		db,
		async setup() {
			await db.execute(`CREATE TABLE "articles" (
			"slug" text PRIMARY KEY NOT NULL,
			"title" text NOT NULL,
			"description" text NOT NULL,
			"body" text NOT NULL,
			"createdAt" timestamp NOT NULL,
			"updatedAt" timestamp NOT NULL
		);
		`);

			await db.execute(`CREATE TABLE "comments" (
			"id" text PRIMARY KEY NOT NULL,
			"article_slug" text NOT NULL,
			"body" text NOT NULL,
			"createdAt" timestamp NOT NULL,
			"updatedAt" timestamp NOT NULL
		);
		`);
		},
		async destroy() {
			await client.close();
		},
	};
}

export function setupGelDb() {
	const gelClient = createClient();
	const db = drizzleGel<typeof gelSchema>({
		client: gelClient,
		schema: gelSchema,
	});

	async function setup() {
		const article = await db
			.select()
			.from(gelSchema.article)
			.where(eq(gelSchema.article.slug, TEST_ARTICLE.slug))
			.execute()
			.then((res) => res.at(0));

		if (article) {
			await db
				.delete(gelSchema.comment)
				.where(eq(gelSchema.comment.articleId, article.id))
				.execute();

			await db
				.delete(gelSchema.article)
				.where(eq(gelSchema.article.slug, TEST_ARTICLE.slug))
				.execute();
		}

		const anotherArticle = await db
			.select()
			.from(gelSchema.article)
			.where(eq(gelSchema.article.slug, ANOTHER_ARTICLE.slug))
			.execute()
			.then((res) => res.at(0));

		if (anotherArticle) {
			await db
				.delete(gelSchema.comment)
				.where(eq(gelSchema.comment.articleId, anotherArticle.id))
				.execute();

			await db
				.delete(gelSchema.article)
				.where(eq(gelSchema.article.slug, anotherArticle.slug))
				.execute();
		}
	}

	return { db, setup };
}

export function setupKyselySqliteDb() {
	const sqlite = new Database(":memory:");
	const db = new Kysely<KyselyDatabase>({
		dialect: new BunSqliteDialect({ database: sqlite }),
	});

	db.schema
		.createTable("articles")
		.addColumn("slug", "text", (col) => col.primaryKey().notNull())
		.addColumn("title", "text", (col) => col.notNull())
		.addColumn("description", "text", (col) => col.notNull())
		.addColumn("body", "text", (col) => col.notNull())
		.addColumn("createdAt", "integer", (col) => col.notNull())
		.addColumn("updatedAt", "integer", (col) => col.notNull())
		.execute()
		.then(() =>
			db.schema
				.createTable("comments")
				.addColumn("id", "text", (col) => col.primaryKey().notNull())
				.addColumn("articleSlug", "text", (col) => col.notNull())
				.addColumn("body", "text", (col) => col.notNull())
				.addColumn("createdAt", "integer", (col) => col.notNull())
				.addColumn("updatedAt", "integer", (col) => col.notNull())
				.execute(),
		);

	return db;
}

export function setupTypeormSqliteDb() {
	const dataSource = new DataSource({
		type: "sqlite",
		database: ":memory:",
		entities: [ArticleEntity, CommentEntity],
		synchronize: true,
	});
	return dataSource;
}
