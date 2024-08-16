import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { Google } from "../components/icons/google";

export async function loader({ context, request }: LoaderFunctionArgs) {
	await context.auth.authenticator.isAuthenticated(request, {
		successRedirect: "/documents",
	});
	const session = await context.auth.sessionStorage.getSession(
		request.headers.get("cookie"),
	);

	const error = session.get(context.auth.authenticator.sessionErrorKey);

	console.log("error", error);
	return json(
		{ error },
		{
			headers: {
				"Set-Cookie": await context.auth.sessionStorage.commitSession(session), // You must commit the session whenever you read a flash
			},
		},
	);
}

export default function Login() {
	const { error } = useLoaderData<typeof loader>();

	return (
		<>
			{error && (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline">{error}</span>
				</div>
			)}
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
