import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { desc, eq } from "drizzle-orm";
import { Plus } from "../components/icons/plus";
import { documents } from "../lib/db/schema";
import { Button } from "../components/ui/button";
import { Heading } from "../components/ui/heading";
import { Upload as DocumentUploader } from "../components/documents/upload";
import { formatDistanceToNowStrict } from "date-fns";
import { MAX_FILE_COUNT } from "../lib/constants";

export async function loader({ context, request }: LoaderFunctionArgs) {
	try {
		const user = await context.auth.authenticator.isAuthenticated(request);

		if (!user) {
			return redirect("/login");
		}

		const allDocuments = await context.db
			.select()
			.from(documents)
			.where(eq(documents.userId, user.id))
			.orderBy(desc(documents.createdAt));

		return json({ allDocuments });
	} catch (error) {
		throw new Error(`Error loading documents: ${error}`);
	}
}

export default function Documents() {
	const { allDocuments } = useLoaderData<typeof loader>();

	return (
		<div className="p-6 my-12 container mx-auto lg:max-w-7xl">
			<div className="flex items-start justify-between">
				<Heading size="3xl" className="text-[#eeeeee] mb-5">
					Documents
				</Heading>
				{allDocuments.length > 0 && (
					<Form action="/document/new">
						<Button
							isDisabled={allDocuments.length >= MAX_FILE_COUNT}
							size="lg"
							variant="primary"
							type="submit"
						>
							New Document
							<Plus className="w-4 h-4 ml-2" />
						</Button>
					</Form>
				)}
			</div>

			<div className="flex flex-col gap-5">
				{allDocuments.length === 0 ? (
					<>
						{" "}
						<DocumentUploader />
					</>
				) : (
					<>
						{allDocuments.map((document) => (
							<Link
								key={document.id}
								to={`/documents/${document.documentId}/chat`}
								className="group p-5 rounded-xl bg-muted-element hover:bg-muted-element-hover focus:outline-none focus-visible:ring-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted-app"
							>
								<Heading
									size="lg"
									className="text-muted-high-contrast group-hover:text-primary-base mb-3"
								>
									{document.title}
								</Heading>
								<p className="mb-0.5">
									{formatDistanceToNowStrict(new Date(document.createdAt))} ago
								</p>
							</Link>
						))}
					</>
				)}
			</div>
		</div>
	);
}
