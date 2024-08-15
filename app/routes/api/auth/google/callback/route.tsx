import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export const loader = ({ request, context }: LoaderFunctionArgs) => {
	return context.auth.authenticator.authenticate("google", request, {
		successRedirect: "/documents",
		failureRedirect: "/login",
	});
};
