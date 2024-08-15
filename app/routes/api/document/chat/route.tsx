import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { LangChainAdapter, type Message } from "ai";
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { eq } from "drizzle-orm";
import { NeonPostgres } from "@langchain/community/vectorstores/neon";
import { createDbClient } from "../../../../lib/db";
import { vectorDatabases } from "../../../../lib/db/schema";
import { createNeonApiClient } from "../../../../lib/vector-db";

export const action = async ({ context, request }: ActionFunctionArgs) => {
	const user = await context.auth.authenticator.isAuthenticated(request);

	if (!user) {
		return json(
			{
				error: "Unauthorized",
			},
			401,
		);
	}

	const {
		messages,
		documentId,
	}: {
		messages: Message[];
		documentId: string;
	} = await request.json();

	// get the user's last message

	const { content: prompt } = messages[messages.length - 1];

	const db = createDbClient(context.cloudflare.env.DATABASE_URL);

	const vectorDb = await db
		.select()
		.from(vectorDatabases)
		.where(eq(vectorDatabases.userId, user.id));

	const neonApiClient = createNeonApiClient(
		context.cloudflare.env.NEON_API_KEY,
	);

	const { data, error } = await neonApiClient.GET(
		"/projects/{project_id}/connection_uri",
		{
			params: {
				path: {
					project_id: vectorDb[0].vectorDbId,
				},
				query: {
					role_name: "neondb_owner",
					database_name: "neondb",
				},
			},
		},
	);

	if (error) {
		return json({
			error: error,
		});
	}

	const embeddings = new OpenAIEmbeddings({
		apiKey: context.cloudflare.env.OPENAI_API_KEY,
		dimensions: 1536,
		model: "text-embedding-3-small",
	});

	const vectorStore = await NeonPostgres.initialize(embeddings, {
		connectionString: data.uri,
		tableName: "embeddings",
		columns: {
			contentColumnName: "content",
			metadataColumnName: "metadata",
			vectorColumnName: "embedding",
		},
	});

	const result = await vectorStore.similaritySearch(prompt, 2, {
		documentId,
	});

	const model = new ChatOpenAI({
		model: "gpt-3.5-turbo-0125",
		temperature: 0,
	});

	const allMessages = messages.map((message) =>
		message.role === "user"
			? new HumanMessage(message.content)
			: new AIMessage(message.content),
	);

	const systemMessage = new SystemMessage(
		`You are a helpful assistant, here's some extra additional context that you can use to answer questions. Only use this information if it's relevant:
		
		${result.map((r) => r.pageContent).join(" ")}`,
	);

	allMessages.push(systemMessage);

	const stream = await model.stream(allMessages);

	return LangChainAdapter.toDataStreamResponse(stream);
};
