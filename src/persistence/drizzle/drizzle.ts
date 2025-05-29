import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./sqliteSchema.ts";

const appDb = drizzle(new Database(":memory:"), {
  schema,
});
