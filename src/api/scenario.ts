import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
	ANOTHER_ARTICLE,
	CREATE_ARTICLE,
	CREATE_COMMENT,
	TEST_ARTICLE,
	TEST_COMMENT,
	UPDATE_ANOTHER_ARTICLE,
} from "../domain/fixtures";
import { createFakeContext, type TestContext } from "./context";
import { createFetchClient, type FetchClient } from "./fetchClient";
import { setupMemoryDb, setupPgliteDb, setupGelDb } from "./deps";
import createDrizzleSqliteArticleRepo from "../persistence/drizzle/DrizzleSqliteArticleRepo";
import { createDrizzlePgArticleRepo } from "../persistence/drizzle/DrizzlePgArticleRepo";
import createDrizzleSqliteCommentRepo from "../persistence/drizzle/DrizzleSqliteCommentRepo";
import createDrizzlePgCommentRepo from "../persistence/drizzle/DrizzlePgCommentRepo";
import { createDrizzleGelArticleRepo } from "../persistence/drizzle/DrizzleGelArticleRepo";
import { createDrizzleGelCommentRepo } from "../persistence/drizzle/DrizzleGelCommentRepo";

export function runTestScenario(
	implName: string,
	setup: () => {
		client: FetchClient;
		context: TestContext;
		teardown: () => Promise<void>;
	},
) {
	describe(implName, () => {
		const { client, context, teardown } = setup();
		beforeAll(async () => {
			await context.setup?.();
			console.log(`setup ${implName}`);
		});

		afterAll(async () => {
			await teardown();
			console.log(`teardown ${implName}`);
		});

		it("404 invalid route", async () => {
			await expect(client.post("/api/atciel", {})).rejects.toThrow();
		});

		it("404 not exist", async () => {
			const id = "not-exist";
			await expect(
				client.get(`/api/articles/${id}`).catch((res) => res.status),
			).resolves.toBe(404);
		});

		it("validation", async () => {
			const promise = client.post("/api/articles", {});
			await expect(promise).rejects.toThrow();
		});

		it("Article", async () => {
			const logs: string[] = [];

			try {
				logs.push("before GET /api/articles");
				const before = await client.get("/api/articles");

				expect(before).toStrictEqual({
					articles: [],
				});

				logs.push("POST /api/articles");
				await client.post("/api/articles", {
					article: CREATE_ARTICLE,
				});

				logs.push("after GET /api/articles");
				const after = await client.get("/api/articles");

				expect(after).toStrictEqual({
					articles: [
						{
							...TEST_ARTICLE,
							createdAt: TEST_ARTICLE.createdAt.toISOString(),
							updatedAt: TEST_ARTICLE.createdAt.toISOString(),
						},
					],
				});

				logs.push("conflict POST /api/articles");
				expect(
					await client
						.post("/api/articles", {
							article: CREATE_ARTICLE,
						})
						.catch((res) => res.status),
				).toBe(409);

				logs.push(`before update GET /api/articles/${TEST_ARTICLE.slug}`);
				const beforeArticle = await client.get(
					`/api/articles/${TEST_ARTICLE.slug}`,
				);

				expect(beforeArticle).toStrictEqual({
					article: {
						...TEST_ARTICLE,
						createdAt: TEST_ARTICLE.createdAt.toISOString(),
						updatedAt: TEST_ARTICLE.createdAt.toISOString(),
					},
				});

				logs.push(`PUT /api/articles/${TEST_ARTICLE.slug}`);
				context.setNow(ANOTHER_ARTICLE.updatedAt);
				await client.put(`/api/articles/${TEST_ARTICLE.slug}`, {
					article: UPDATE_ANOTHER_ARTICLE,
				});

				logs.push(`after update GET /api/articles/${ANOTHER_ARTICLE.slug}`);
				const afterArticle = await client.get(
					`/api/articles/${ANOTHER_ARTICLE.slug}`,
				);

				expect(afterArticle).toStrictEqual({
					article: {
						...ANOTHER_ARTICLE,
						createdAt: ANOTHER_ARTICLE.createdAt.toISOString(),
						updatedAt: ANOTHER_ARTICLE.updatedAt.toISOString(),
					},
				});

				logs.push(`DELETE /api/articles/${ANOTHER_ARTICLE.slug}`);
				await client.del(`/api/articles/${ANOTHER_ARTICLE.slug}`);

				logs.push("after delete GET /api/articles");
				const afterDelete = await client.get("/api/articles");

				expect(afterDelete).toStrictEqual({
					articles: [],
				});

				logs.push("End");
			} catch (throwable) {
				let error = throwable;
				if (throwable instanceof Response) {
					error = new Error(
						`${throwable.status} ${
							throwable.statusText
						}\n\n${await throwable.text()}`,
					);
				}

				if (error instanceof Error) {
					error.message = `[Logs]\n\n${logs.join(
						"\n",
					)}\n\n[Original Error]\n\n${error.message}`;
				}

				throw error;
			}
		});

		it("Comment", async () => {
			const logs: string[] = [];

			try {
				logs.push("POST /api/articles");
				await client.post("/api/articles", {
					article: CREATE_ARTICLE,
				});

				logs.push(`before GET /api/articles/${TEST_ARTICLE.slug}/comments`);
				const before = await client.get(
					`/api/articles/${TEST_ARTICLE.slug}/comments`,
				);

				expect(before).toStrictEqual({
					comments: [],
				});

				context.setNextId(TEST_COMMENT.id);
				logs.push(`POST /api/articles/${TEST_ARTICLE.slug}/comments`);
				await client.post(`/api/articles/${TEST_ARTICLE.slug}/comments`, {
					comment: CREATE_COMMENT,
				});

				logs.push(`after GET /api/articles/${TEST_ARTICLE.slug}/comments`);
				const after = await client.get(
					`/api/articles/${TEST_ARTICLE.slug}/comments`,
				);

				expect(after).toStrictEqual({
					comments: [
						{
							...TEST_COMMENT,
							createdAt: TEST_COMMENT.createdAt.toISOString(),
							updatedAt: TEST_COMMENT.updatedAt.toISOString(),
						},
					],
				});

				logs.push(
					`DELETE /api/articles/${TEST_ARTICLE.slug}/comments/${TEST_COMMENT.id}`,
				);
				await client.del(
					`/api/articles/${TEST_ARTICLE.slug}/comments/${TEST_COMMENT.id}`,
				);

				logs.push(
					`after delete GET /api/articles/${TEST_ARTICLE.slug}/comments`,
				);
				const afterDelete = await client.get(
					`/api/articles/${TEST_ARTICLE.slug}/comments`,
				);

				expect(afterDelete).toStrictEqual({
					comments: [],
				});

				logs.push("End");
			} catch (throwable) {
				let error = throwable;
				if (throwable instanceof Response) {
					error = new Error(
						`${throwable.status} ${
							throwable.statusText
						}\n\n${await throwable.text()}`,
					);
				}

				if (error instanceof Error) {
					error.message = `[Logs]\n\n${logs.join(
						"\n",
					)}\n\n[Original Error]\n\n${error.message}`;
				}

				throw error;
			}
		});
	});
}

export function runTest(
	appName: string,
	createApp: (ctx: TestContext) => Promise<{
		fetch: (request: Request) => Promise<Response> | Response;
		teardown?: () => Promise<void>;
	}>,
) {
	runTestScenario(`${appName} api - fake repo`, () => {
		const fakeRepoContext = createFakeContext({});
		const appPromise = createApp(fakeRepoContext);

		return {
			client: createFetchClient((request) =>
				appPromise.then((app) => app.fetch(request)),
			),
			context: fakeRepoContext,
			teardown: async () => {
				await appPromise.then((app) => app.teardown?.());
			},
		};
	});

	runTestScenario(`${appName} api - drizzle sqlite`, () => {
		const sqliteDb = setupMemoryDb(appName);
		const drizzleSqliteRepoContext = createFakeContext({
			repo: {
				article: createDrizzleSqliteArticleRepo(sqliteDb),
				comment: createDrizzleSqliteCommentRepo(sqliteDb),
			},
		});
		const drizzleSqliteApp = createApp(drizzleSqliteRepoContext);

		return {
			client: createFetchClient((request) =>
				drizzleSqliteApp.then((app) => app.fetch(request)),
			),
			context: drizzleSqliteRepoContext,
			teardown: async () => {
				await drizzleSqliteApp.then((app) => app.teardown?.());
			},
		};
	});

	runTestScenario(`${appName} api - drizzle Pg`, () => {
		const pgDb = setupPgliteDb();
		const drizzlePgRepoContext = createFakeContext({
			repo: {
				article: createDrizzlePgArticleRepo(pgDb.db),
				comment: createDrizzlePgCommentRepo(pgDb.db),
			},
			setup: pgDb.setup,
		});
		const drizzlePgApp = createApp(drizzlePgRepoContext);

		return {
			client: createFetchClient((request) =>
				drizzlePgApp.then((app) => app.fetch(request)),
			),
			context: drizzlePgRepoContext,
			teardown: async () => {
				await drizzlePgApp.then((app) => app.teardown?.());
			},
		};
	});

	runTestScenario(`${appName} api - drizzle gel`, () => {
		const { db, setup } = setupGelDb();
		const gelRepoContext = createFakeContext({
			repo: {
				article: createDrizzleGelArticleRepo(db),
				comment: createDrizzleGelCommentRepo(db),
			},
			setup,
		});
		const gelApp = createApp(gelRepoContext);

		return {
			client: createFetchClient((request) =>
				gelApp.then((app) => app.fetch(request)),
			),
			context: gelRepoContext,
			teardown: async () => {
				await gelApp.then((app) => app.teardown?.());
			},
		};
	});
}
