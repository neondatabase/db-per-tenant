import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";

export const loader = () => redirect("/login");

export const action = ({ request, context }: ActionFunctionArgs) => {
	return context.auth.authenticator.authenticate("google", request);
};
