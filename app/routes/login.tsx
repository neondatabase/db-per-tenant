import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { Button } from "../components/ui/button";

export async function loader({ context, request }: LoaderFunctionArgs) {
	return await context.auth.authenticator.isAuthenticated(request, {
		successRedirect: "/documents",
	});
}

export default function Login() {
	return (
		<>
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#111111] px-6 text-[#b4b4b4]">
				<div className="w-full max-w-md">
					<h1 className="mb-3 text-2xl font-medium text-[#eeeeee]">Sign in</h1>
					<Form action="/api/auth/google" method="POST">
						<Button type="submit" variant="primary">
							Login With Google
						</Button>
					</Form>
				</div>
			</div>
		</>
	);
}
