import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { Google } from "../components/icons/google";
import { Heading } from "../components/ui/heading";

export async function loader({ context, request }: LoaderFunctionArgs) {
	return await context.auth.authenticator.isAuthenticated(request, {
		successRedirect: "/documents",
	});
}

export default function Login() {
	return (
		<>
			<div className="flex min-h-screen flex-col items-center justify-center px-6 ">
				<div className="w-full max-w-md">
					<div className="flex items-center justify-center gap-x-6">
						<Form action="/api/auth/google" method="POST">
							<Button type="submit" variant="outline">
								<Google className="w-4 h-4 mr-2" /> Continue with Google
							</Button>
						</Form>
					</div>
				</div>
			</div>
		</>
	);
}
