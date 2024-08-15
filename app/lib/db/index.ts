import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const createDbClient = (connectionString: string) => {
	const sql = neon(connectionString);
	return drizzle(sql, { schema });
};
