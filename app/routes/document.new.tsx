import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Upload as DocumentUploader } from "../components/documents/upload";
import { Heading } from "../components/ui/heading";

export async function loader({ context, request }: LoaderFunctionArgs) {
	return await context.auth.authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
}

export default function Upload() {
	return (
		<main className="flex flex-col container mx-auto mt-12 ">
			<div className="p-6 my-12 container mx-auto lg:max-w-7xl">
				<Heading size="3xl" className="text-[#eeeeee] mb-5">
					Upload document
				</Heading>
				<DocumentUploader />
			</div>
		</main>
	);
}
