import type { AppLoadContext } from "@remix-run/cloudflare";
import type { PlatformProxy } from "wrangler";
import { AuthService, type IAuthService } from "./app/lib/auth";
import { type Env, EnvSchema } from "./app/lib/env";

export type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: Cloudflare;
		auth: IAuthService;
	}
}

type GetLoadContext = (args: {
	request: Request;
	context: { cloudflare: Cloudflare };
}) => AppLoadContext;

export const getLoadContext: GetLoadContext = ({ context, request }) => {
	const env = EnvSchema.parse(context.cloudflare.env);
	const url = new URL(request.url);
	const { hostname } = url;
	const auth = new AuthService(env, hostname);

	return {
		...context,
		auth,
	};
};
