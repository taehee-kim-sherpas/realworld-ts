import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite/driver";
import * as schema from "../persistence/drizzle/schema.ts";

export function setupMemoryDb() {
	const db = drizzle(new Database(":memory:"), {
		schema,
	});

	db.run(`CREATE TABLE "articles" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"body" text NOT NULL,
	"createdAt" integer NOT NULL,
	"updatedAt" integer NOT NULL
);
`);
	return db;
}
