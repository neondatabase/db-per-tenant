import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "app/lib/vector-db/schema.ts",
	out: "app/lib/vector-db/migrations",
	dialect: "postgresql",
});
