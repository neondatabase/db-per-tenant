import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Upload as DocumentUploader } from "../components/documents/upload";
import { Heading } from "../components/ui/heading";
import { authenticator } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
}

export default function NewDocument() {
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
