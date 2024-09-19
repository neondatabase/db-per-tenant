import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { db } from "~/lib/db";
import { vectorDatabases } from "~/lib/db/schema";
import { neonApiClient } from "~/lib/vector-db";

const main = async () => {
	try {
		const databases = await db.select().from(vectorDatabases);
		console.log("Databases to migrate:", databases.length);

		for (const database of databases) {
			const { vectorDbId } = database;

			try {
				const getProject = await neonApiClient.GET(
					"/projects/{project_id}/connection_uri",
					{
						params: {
							path: {
								project_id: vectorDbId,
							},
							query: {
								role_name: "neondb_owner",
								database_name: "neondb",
							},
						},
					},
				);

				const connectionString = getProject.data?.uri;

				if (!connectionString) {
					throw new Error(
						`Connection string not found for database ${vectorDbId}`,
					);
				}

				const client = postgres(connectionString, { max: 1 });
				const drizzleDb = drizzle(client);

				await migrate(drizzleDb, {
					migrationsFolder: "app/lib/vector-db/migrations",
				});

				await client.end();

				console.log(`Successfully migrated database ${vectorDbId}`);
			} catch (error) {
				console.error(`Error migrating database ${vectorDbId}:`, error);
				// Continue with the next database instead of stopping the entire process
			}
		}

		console.log("Migration process completed");
	} catch (error) {
		console.error("Error in main process:", error);
	} finally {
		process.exit(0);
	}
};

main();
