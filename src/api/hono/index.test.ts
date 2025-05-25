import { runTestScenario } from "../scenario";
import { describe } from "bun:test";
import { createFetchClient } from "../fetchClient.ts";
import { createApp } from "./index.ts";
import { createFakeContext } from "../context.ts";

describe("hono", () => {
	const context = createFakeContext();

	const app = createApp(context);
	runTestScenario("hono api", createFetchClient(app.request), context);
});
