import { expect, test } from "bun:test";
import { createApp } from ".";
import { runTest } from "../scenario";

test("setup", () => {
	expect(1 + 1).toBe(2);
});

runTest("elysia", async (ctx) => {
	const app = createApp(ctx);

	return {
		fetch: app.handle,
	};
});
