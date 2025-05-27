
import { createFakeContext } from "../context";
import { runTestScenario } from "../scenario";
import { afterAll, describe } from "bun:test";
import { setupTestServer } from "./testServer";
import { createFetchClient } from "../fetchClient";

describe("Express", async () => {
		const fakeRepoContext = createFakeContext({});
		const app = await setupTestServer(fakeRepoContext);
		
		runTestScenario("Express api - fake repo", createFetchClient(app.fetch), fakeRepoContext);

		afterAll(async () => {
			await app.teardown();
		})
});
