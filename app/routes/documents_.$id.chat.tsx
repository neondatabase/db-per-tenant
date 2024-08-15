import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { Button } from "../components/ui/button";
import { Bot } from "../components/icons/bot";
import { Send } from "../components/icons/send";
import { Spinner } from "../components/icons/spinner";
import { User } from "../components/icons/user";

import { documents } from "../lib/db/schema";
import { useChat } from "ai/react";
import { Input } from "../components/ui/input";

export const loader = async ({
	context,
	request,
	params,
}: LoaderFunctionArgs) => {
	const documentId = params.id as string;

	try {
		const user = await context.auth.authenticator.isAuthenticated(request);

		if (!user) {
			return redirect("/login");
		}

		const document = await context.db
			.select()
			.from(documents)
			.where(eq(documents.documentId, documentId));

		const url = await getSignedUrl(
			new S3Client({
				region: "auto",
				endpoint: `https://${context.cloudflare.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: context.cloudflare.env.CLOUDFLARE_R2_ACCESS_ID,
					secretAccessKey: context.cloudflare.env.CLOUDFLARE_R2_SECRET_KEY,
				},
			}),
			new GetObjectCommand({
				Bucket: context.cloudflare.env.CLOUDFLARE_R2_BUCKET_NAME,
				Key: document[0].fileName,
			}),
			{
				expiresIn: 600,
			},
		);

		return json({
			documentId,
			url,
		});
	} catch (error) {
		throw new Error(`Error loading document: ${error}`);
	}
};

export default function DocumentChat() {
	const { documentId, url } = useLoaderData<typeof loader>();

	const { messages, input, handleInputChange, handleSubmit, isLoading } =
		useChat({
			body: { documentId },
			api: "/api/document/chat",
		});

	return (
		<div className="flex flex-col md:items-end h-[90vh] md:flex-row overflow-hidden">
			<iframe src={url} width="100%" height="100%" title="Document" />
			<div className="w-full flex flex-col h-full bg-muted-app-subtle">
				<div className=" flex-grow overflow-y-auto flex flex-col h-auto max-h-[40vh] md:max-h-full">
					{messages.length > 0
						? messages.map((m) => (
								<div
									key={m.id}
									className="whitespace-pre-wrap p-3 m-1 flex items-center gap-2 border-b border-muted"
								>
									{m.role === "user" ? (
										<div className="rounded-xl bg-muted-element p-2 mr-2">
											<User className="w-4 h-4" />
										</div>
									) : (
										<div className="rounded-xl bg-muted-element p-2 mr-2">
											<Bot className="w-4 h-4" />
										</div>
									)}
									{m.content}
								</div>
							))
						: null}
				</div>
				<form className="m-5 flex items-center gap-2" onSubmit={handleSubmit}>
					<Input
						className="bottom-0 w-full"
						value={input}
						placeholder="Send a message..."
						required
						maxLength={500}
						onChange={handleInputChange}
					/>
					<Button type="submit" size="icon">
						{isLoading ? (
							<Spinner className="w-4 h-4" />
						) : (
							<Send className="w-4 h-4" />
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}
