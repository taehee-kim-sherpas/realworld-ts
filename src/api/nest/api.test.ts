import { expect, test } from "bun:test";
import { runTest } from "../scenario";
import { setupTestServer } from "./setupTestServer";

test("setup", () => {
  expect(1 + 1).toBe(2);
});

runTest("nest", async (ctx) => setupTestServer(ctx));
