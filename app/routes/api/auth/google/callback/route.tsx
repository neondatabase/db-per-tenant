import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/lib/auth";

export const loader = ({ request }: LoaderFunctionArgs) => {
	return authenticator.authenticate("google", request, {
		successRedirect: "/documents",
		failureRedirect: "/login",
	});
};
