import { expect, test } from "bun:test";
import { createApp } from ".";
import { runRepositoryTests } from "../scenario";

test("setup", () => {
	expect(1 + 1).toBe(2);
});

runRepositoryTests("elysia", async (ctx) => {
	const app = createApp(ctx);

	return {
		fetch: app.handle,
	};
});
