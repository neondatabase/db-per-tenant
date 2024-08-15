import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "@remix-run/cloudflare";
import { Form, Link } from "@remix-run/react";

import { Github } from "../components/icons/github";
import { Google } from "../components/icons/google";
import { Button } from "../components/ui/button";

export const meta: MetaFunction = () => {
	return [
		{ title: "AI Vector Database Per tenant" },
		{
			name: "description",
			content: "Example app where each tenant has its own Vector database",
		},
	];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const user = await context.auth.authenticator.isAuthenticated(request);

	if (user) {
		return redirect("/documents");
	}
	return json({ user: null });
}

export default function Index() {
	return (
		<div>
			<div className="px-6 pt-14">
				<div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
					<div className="text-center">
						<h1 className="text-3xl text-muted-high-contrast font-bold tracking-tight sm:text-6xl text-balance">
							AI vector database per tenant
						</h1>
						<p className="mt-6 md:text-lg text-balance">
							Example chat-with-pdf app showing how to provision a dedicated
							vector database instance for each user.{" "}
							<a
								href="https://neon.tech?ref=vector-db-per-tenant"
								className="text-primary-base hover:underline"
							>
								Powered by Neon{" "}
							</a>
						</p>
						<div className="mt-10 flex flex-col md:flex-row items-center w-full justify-center gap-6">
							<Form action="/api/auth/google" method="POST">
								<Button type="submit" variant="outline">
									<Google className="w-4 h-4 mr-2" /> Continue with Google
								</Button>
							</Form>

							<>
								<a
									className="border border-muted bg-transparent hover:border-muted-hover hover:bg-muted-element-hover hover:text-muted-high-contrast focus-visible-visible:text-muted-high-contrast 	inline-flex items-center justify-center rounded-lg text-sm transition-colors text-muted-base 
				focus:outline-none focus-visible:ring-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted-app h-9 px-4 py-3"
									href="https://github.com/neondatabase/ai-vector-db-per-tenant"
								>
									<Github className="w-4 h-4 mr-2" /> View code
								</a>
							</>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
