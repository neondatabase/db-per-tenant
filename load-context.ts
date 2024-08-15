import type { AppLoadContext } from "@remix-run/cloudflare";
import type { PlatformProxy } from "wrangler";
import { AuthService, type IAuthService } from "./app/lib/auth";
import { type Env, EnvSchema } from "./app/lib/env";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./app/lib/db/schema";

export type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: Cloudflare;
		auth: IAuthService;
		db: NeonHttpDatabase<typeof schema>;
	}
}

type GetLoadContext = (args: {
	request: Request;
	context: { cloudflare: Cloudflare };
}) => AppLoadContext;

export const getLoadContext: GetLoadContext = ({ context, request }) => {
	try {
		const env = EnvSchema.parse(context.cloudflare.env);
		const auth = new AuthService(env);

		const sql = neon(context.cloudflare.env.DATABASE_URL);

		const db = drizzle(sql, { schema });

		return {
			...context,
			auth,
			db,
		};
	} catch (error) {
		console.log("ERROR:", error);
		throw error;
	}
};
