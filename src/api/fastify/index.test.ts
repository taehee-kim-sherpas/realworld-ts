import { expect, test } from "bun:test";
import { runTest } from "../scenario";
import { setupTestServer } from "./testServer";

test("setup", () => {
  expect(1 + 1).toBe(2);
});
runTest("Fastify", async (ctx) => setupTestServer(ctx));
