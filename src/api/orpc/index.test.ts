import { expect, test } from "bun:test";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createApp, createRouter } from ".";
import {
	ANOTHER_ARTICLE,
	CREATE_ARTICLE,
	TEST_ARTICLE,
	UPDATE_ANOTHER_ARTICLE,
} from "../../domain/fixtures.ts";
import { createFakeContext } from "../context";
import { runTest } from "../scenario";

test("orpc client test", async () => {
	const ctx = createFakeContext({});

	const contract = createRouter(ctx);

	const app = createApp(ctx);

	const link = new OpenAPILink(contract, {
		url: "http://localhost:3000/",
		headers: () => ({
			"x-api-key": "my-api-key",
		}),
		fetch: app.fetch,
	});

	const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
		createORPCClient(link);

	const before = await client.articles.list();

	expect(before).toEqual({
		articles: [],
	});

	const article = await client.articles.create({
		article: CREATE_ARTICLE,
	});

	expect(article).toEqual({
		article: {
			...TEST_ARTICLE,
			createdAt: TEST_ARTICLE.createdAt.toISOString(),
			updatedAt: TEST_ARTICLE.updatedAt.toISOString(),
		},
	});

	const after = await client.articles.list();

	expect(after).toEqual({
		articles: [article.article],
	});

	ctx.setNow(new Date("2024-02-01T00:00:00.000Z"));

	const updated = await client.articles.update({
		slug: TEST_ARTICLE.slug,
		article: UPDATE_ANOTHER_ARTICLE,
	});

	expect(updated).toEqual({
		article: {
			...ANOTHER_ARTICLE,
			createdAt: ANOTHER_ARTICLE.createdAt.toISOString(),
			updatedAt: ANOTHER_ARTICLE.updatedAt.toISOString(),
		},
	});

	const comments = await client.articles.comments.list({
		slug: ANOTHER_ARTICLE.slug,
	});

	expect(comments).toEqual({
		comments: [],
	});

	const comment = await client.articles.comments.create({
		slug: ANOTHER_ARTICLE.slug,
		comment: {
			body: "Test Comment",
		},
	});
});
runTest("orpc", async (ctx) => createApp(ctx));
