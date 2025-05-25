import { runTestScenario } from "../scenario";
import { describe } from "bun:test";
import { createFetchClient } from "../fetchClient.ts";
import { createApp } from "./index.ts";
import { createFakeContext } from "../context.ts";
import createDrizzleSqliteArticleRepo from "../../persistence/drizzle/DrizzleSqliteBatchRepo.ts";
import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite/driver";
import * as schema from "../../persistence/drizzle/schema.ts";

describe("hono", () => {
	const fakeRepoContext = createFakeContext({});
	const app = createApp(fakeRepoContext);
	runTestScenario("hono api", createFetchClient(app.request), fakeRepoContext);

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
`)
	const drizzleRepoContext = createFakeContext({
		repo: {
			article: createDrizzleSqliteArticleRepo(db)
		}
	});
	const drizzleApp = createApp(drizzleRepoContext);
	runTestScenario("hono api - drizzle sqlite", createFetchClient(drizzleApp.request), drizzleRepoContext);
});
