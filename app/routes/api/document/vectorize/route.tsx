import { json, redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NeonPostgres } from "@langchain/community/vectorstores/neon";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { extractText, getDocumentProxy } from "unpdf";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { documents, vectorDatabases } from "../../../../lib/db/schema";
import { generateId } from "../../../../lib/db/utils/generate-id";
import { createNeonApiClient } from "../../../../lib/vector-db";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

// vectorize document using langchain
// request validation using Zod

// check that user is authenticated, validate request body, generate embeddings and store them in associated vector store for the user, create document
export const action = async ({ context, request }: ActionFunctionArgs) => {
	try {
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

		const user = await context.auth.authenticator.isAuthenticated(request);

		if (!user) {
			return json(
				{
					error: "Unauthorized",
				},
				401,
			);
		}

		const { filename, title }: { filename: string; title: string } =
			await request.json();

		// get user's project ID, and get the connection string

		const vectorDb = await context.db
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
				Key: filename,
			}),
			{
				expiresIn: 600,
			},
		);

		const buffer = await fetch(url).then((res) => res.arrayBuffer());

		const pdf = await getDocumentProxy(new Uint8Array(buffer));
		// Extract text from PDF
		const { text } = await extractText(pdf, { mergePages: true });

		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 100,
		});

		const documentId = generateId({ object: "document" });

		const docOutput = await splitter.splitDocuments([
			new Document({ pageContent: text, metadata: { documentId } }),
		]);

		// add ids and make it the same length as the docOutput
		const result = await vectorStore.addDocuments(docOutput);

		const document = await context.db
			.insert(documents)
			.values({
				documentId: documentId,
				userId: user.id,
				title: title,
				fileName: filename,
			})
			.returning();

		return json({ document: document[0] }, 201);
	} catch (error) {
		return json(
			{
				error: error.message,
			},
			400,
		);
	}
};
