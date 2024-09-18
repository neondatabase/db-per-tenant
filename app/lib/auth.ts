import { GoogleStrategy } from "remix-auth-google";
import { users, vectorDatabases, type User as TUser } from "./db/schema";
import { generateId } from "./db/utils/generate-id";
import { getErrorMessage } from "./utils/get-error-message";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { db } from "./db";
import { drizzle } from "drizzle-orm/postgres-js";
import { neonApiClient } from "./vector-db";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./auth/session.server";

export type User = TUser & {
	vectorDbId: string;
};

export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async ({ profile }) => {
			const email = profile.emails[0].value;

			try {
				const userData = await db
					.select({
						user: users,
						vectorDatabase: vectorDatabases,
					})
					.from(users)
					.leftJoin(vectorDatabases, eq(users.id, vectorDatabases.userId))
					.where(eq(users.email, email));

				if (
					userData.length === 0 ||
					!userData[0].vectorDatabase ||
					!userData[0].user
				) {
					const { data, error } = await neonApiClient.POST("/projects", {
						body: {
							project: {},
						},
					});

					if (error) {
						throw new Error(`Failed to create Neon project, ${error}`);
					}

					const vectorDbId = data?.project.id;

					const vectorDbConnectionUri = data.connection_uris[0]?.connection_uri;

					const sql = postgres(vectorDbConnectionUri);

					await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

					await migrate(drizzle(sql), {
						migrationsFolder: "app/lib/vector-db/migrations",
					});

					const newUser = await db
						.insert(users)
						.values({
							email,
							name: profile.displayName,
							avatarUrl: profile.photos[0].value,
							userId: generateId({ object: "user" }),
						})
						.onConflictDoNothing()
						.returning();

					await db
						.insert(vectorDatabases)
						.values({
							vectorDbId,
							userId: newUser[0].id,
						})
						.returning();

					const result = {
						...newUser[0],
						vectorDbId,
					};

					return result;
				}

				return {
					...userData[0].user,
					vectorDbId: userData[0].vectorDatabase.vectorDbId,
				};
			} catch (error) {
				console.error("User creation error:", error);
				throw new Error(getErrorMessage(error));
			}
		},
	),
);
