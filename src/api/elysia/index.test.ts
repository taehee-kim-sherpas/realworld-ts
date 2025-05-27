import { runTestScenario } from "../scenario";
import { describe } from "bun:test";
import { createFetchClient } from "../fetchClient.ts";
import { createApp } from "./index.ts";
import { createFakeContext } from "../context.ts";
import createDrizzleSqliteArticleRepo from "../../persistence/drizzle/DrizzleSqliteArticleRepo.ts";
import { setupMemoryDb } from "../deps.ts";

describe("elysia", () => {
	const fakeRepoContext = createFakeContext({});
	const app = createApp(fakeRepoContext);
	runTestScenario("elysia api - fake repo", createFetchClient(app.handle), fakeRepoContext);

	const db = setupMemoryDb();
	const drizzleRepoContext = createFakeContext({
		repo: {
			article: createDrizzleSqliteArticleRepo(db),
		},
	});
	const drizzleApp = createApp(drizzleRepoContext);
	runTestScenario(
		"elysia api - drizzle sqlite",
		createFetchClient(drizzleApp.handle),
		drizzleRepoContext,
	);
});
