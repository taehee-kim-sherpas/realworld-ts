import { expect, test } from "bun:test";
import { runTest } from "../scenario";
import { createApp } from "./index.ts";

test("setup", () => {
  expect(1 + 1).toBe(2);
});
runTest("hono", (ctx) => createApp(ctx));
