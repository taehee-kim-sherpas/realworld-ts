import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/persistence/drizzle/schema.ts",
	out: "./migrations",
	// dialect: "turso",
	// dbCredentials: {
	//   url: process.env.TURSO_CONNECTION_URL!,
	//   authToken: process.env.TURSO_AUTH_TOKEN!,
	// },
	dialect: "gel",
});
