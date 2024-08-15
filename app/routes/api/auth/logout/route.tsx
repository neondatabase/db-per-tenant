import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export async function action({ request, context }: ActionFunctionArgs) {
	await context.auth.authenticator.logout(request, { redirectTo: "/login" });
}
