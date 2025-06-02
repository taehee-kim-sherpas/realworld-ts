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

export function setupMemoryDb(
	_key: string,
): BaseSQLiteDatabase<"sync", void, typeof sqliteSchema> {
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
	return db;
}

export function setupPgliteDb(): {
	db: PgDatabase<PgQueryResultHKT, typeof pgSchema>;
	setup: () => Promise<void>;
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
	};
}

export function setupGelDb() {
	const gelClient = createClient();
	const db = drizzleGel<typeof gelSchema>({
		client: gelClient,
		schema: gelSchema,
	});

	async function setup() {
		await db.delete(gelSchema.comment).execute();
		await db.delete(gelSchema.article).execute();
	}

	return { db, setup };
}
