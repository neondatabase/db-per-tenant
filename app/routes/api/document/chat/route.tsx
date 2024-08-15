import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { LangChainAdapter, type Message } from "ai";
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { NeonPostgres } from "@langchain/community/vectorstores/neon";
import { createNeonApiClient } from "../../../../lib/vector-db";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

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
	const ip = request.headers.get("CF-Connecting-IP");
	const identifier = ip ?? "global";

	const ratelimit = new Ratelimit({
		redis: Redis.fromEnv(context.cloudflare.env),
		limiter: Ratelimit.fixedWindow(10, "60 s"),
		analytics: true,
	});

	const { success, limit, remaining, reset } =
		await ratelimit.limit(identifier);

	if (!success) {
		return json(
			{
				error: "Rate limit exceeded",
				limit,
				remaining,
				reset,
			},
			{
				status: 429,
			},
		);
	}

	const {
		messages,
		documentId,
	}: {
		messages: Message[];
		documentId: string;
	} = await request.json();

	const { content: prompt } = messages[messages.length - 1];

	const neonApiClient = createNeonApiClient(
		context.cloudflare.env.NEON_API_KEY,
	);

	const { data, error } = await neonApiClient.GET(
		"/projects/{project_id}/connection_uri",
		{
			params: {
				path: {
					project_id: user.vectorDbId,
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
		apiKey: context.cloudflare.env.OPENAI_API_KEY,
		model: "gpt-4o-mini",
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
