## Scaling Postgres for AI Applications: vector database per tenant

Rather than having all vector embeddings stored in a single Postgres database, you provide each tenant (a user, an organization, a workspace, or any other entity requiring isolation) with its own dedicated Postgres database instance where you can store and query its embeddings.

Depending on your application, you will provision a vector database after a specific event (e.g., user signup, organization creation, or upgrade to paid tier). You will then track tenants and their associated vector databases in your application's main database. 

This approach offers several benefits:
1. Each tenant's data is stored in a separate, isolated database not shared with other tenants. This makes it possible for you to be compliant with data residency requirements (e.g., GDPR)
2. Database resources can be allocated based on each tenant's requirements. 
3. A tenant with a large workload that can impact the database's performance won't affect other tenants; it would also be easier to manage.

Here's an example database architecture diagram of the [demo app](https://ai-vector-db-per-tenant.pages.dev/) that's in this repo. On the surface, it's an app where users can upload PDFs and chat with them. However, under the hood, each user gets a dedicated vector database instance:

![Architecture Diagram](https://github.com/user-attachments/assets/c788d581-1d0a-4201-842e-a20bd498e3db)

The main application's database consists of three tables: `documents`, `users`, and `vector_databases`.

- The `documents` table stores information about files, including their titles, sizes, and timestamps, and is linked to users via a foreign key.
- The `users` table maintains user profiles, including names, emails, and avatar URLs.
- The `vector_databases` table tracks which vector database belongs to which user.

Then, each vector database that gets provisioned has an `embeddings` table for storing document chunks for retrieval-augmented generation (RAG).

For this app, vector databases are provisioned when a user signs up. Once they upload a document, it gets chunked and stored in their dedicated vector database. Finally, once the user chats with their document, the vector similarity search runs against their database to retrieve the relevant information to answer their prompt.

<details>
  <summary>Code snippet example of provisioning a vector database</summary>
   
   ![Provision Vector database for each signup](https://github.com/user-attachments/assets/01e31752-cddb-45c5-b595-92c3cb815a88)

  ```ts
  // Code from app/lib/auth.ts

  // User email from Google Auth
	const email = profile.emails[0].value;

	try {
		const db = createDbClient(env.DATABASE_URL);

		// Get the user and their vector database
		const userData = await db
			.select({
				user: users,
				vectorDatabase: vectorDatabases,
			})
			.from(users)
			.leftJoin(vectorDatabases, eq(users.id, vectorDatabases.userId))
			.where(eq(users.email, email));

		// If the user does not exist, create a new user and vector database
		if (
			userData.length === 0 ||
			!userData[0].vectorDatabase ||
			!userData[0].user
		) {
			// Create a new Neon project
			const neonApiClient = createNeonApiClient(env.NEON_API_KEY);

			const { data, error } = await neonApiClient.POST("/projects", {
				body: {
					project: {},
				},
			});

			if (error) {
				throw new Error(`Failed to create Neon project, ${error}`);
			}

			const vectorDbId = data?.project.id;

			const vectorDbConnectionUri = data.connection_uris[0]?.connection_uri;

			const sql = neon(vectorDbConnectionUri);

			// Create the vector extension and table
			await sql.transaction([
				sql`CREATE EXTENSION IF NOT EXISTS vector;`,
				sql`CREATE TABLE IF NOT EXISTS "embeddings" (
					"id" serial PRIMARY KEY NOT NULL,
					"content" text NOT NULL,
					"metadata" jsonb NOT NULL,
					"embedding" vector(1536),
					"created_at" timestamp with time zone DEFAULT now(),
					"updated_at" timestamp with time zone DEFAULT now()
				)`,
				sql`CREATE INDEX IF NOT EXISTS "embedding_idx" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops)`,
			]);

			// Create the user and vector database and store it in the application's database
			const newUser = await db
				.insert(users)
				.values({
					email,
					name: profile.displayName,
					avatarUrl: profile.photos[0].value,
					userId: generateId({ object: "user" }),
				})
				.onConflictDoNothing()
				.returning();

			await db
				.insert(vectorDatabases)
				.values({
					vectorDbId,
					userId: newUser[0].id,
				})
				.returning();

			const result = {
				...newUser[0],
				vectorDbId,
			};

			return result;
		}
		
		// Return the user and their vector database if they already exist
		return {
			...userData[0].user,
			vectorDbId: userData[0].vectorDatabase.vectorDbId,
		};
	} catch (error) {
		console.error("User creation error:", error);
		throw new Error(getErrorMessage(error));
	}
  ```
</details>


<details>
  <summary>Code snippet and diagram of RAG</summary>
	
![Vector database per tenant RAG](https://github.com/user-attachments/assets/43e0f872-6bab-4a06-8208-7871723f1fd0)

  ```ts
// Code from app/routes/api/document/chat
// Get the user's messages and the document ID from the request body.
const {
		messages,
		documentId,
	}: {
		messages: Message[];
		documentId: string;
	} = await request.json();

	// Get the user's prompt
	const { content: prompt } = messages[messages.length - 1];

	const neonApiClient = createNeonApiClient(
		context.cloudflare.env.NEON_API_KEY,
	);

	// Get the user's vector database's connection string by passing the user's vector database ID to the Neon API.
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
// Search for the most similar document chunks to the user's prompt in the vector database. 
// Under the hood, Langchain converts the user's prompt to a vector using the OpenAI embeddings model and then searches for the most similar vectors in the vector database.
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
// Generate a response by passing the user's messages and the additional context to the OpenAI model.
	const stream = await model.stream(allMessages);

	return LangChainAdapter.toDataStreamResponse(stream);
  ```
</details>


While this approach is beneficial, it can also be challenging to implement. You need to manage each database's lifecycle, including provisioning, scaling, and de-provisioning. Fortunately, Postgres on Neon is set up differently:

1. Postgres on Neon can be provisioned via the in ~2 seconds, making provisioning a Postgres database for every tenant possible. You don't need to wait several minutes for the database to be ready.
2. The database's compute can automatically scale up to meet an application's workload and can shut down when the database is unused.

<div align="left">
  <table>
    <tr>
      <td width="50%">
        <video autoplay src="https://github.com/user-attachments/assets/96500fc3-3efa-4cfa-9339-81eb359ff105" width="100%"></video>
      </td>
      <td width="40%">
        <img src="https://github.com/user-attachments/assets/7f093ead-d51b-46bc-a473-0df483d91c18" width="100%" alt="Autoscaling">
      </td>
    </tr>
  </table>
</div>

This makes the proposed pattern of creating a database per tenant not only possible but also cost-effective.

## Demo app

![Demo app](https://github.com/user-attachments/assets/d9dee48f-a6d6-4dd5-bb89-fa5d31ca26e3)

You can check out the live version at https://ai-vector-db-per-tenant.pages.dev/. It's built using the following technologies:

- [Neon](https://neon.tech/ref=github) - Fully managed Postgres
- [Remix](https://remix.run) - Full-stack React framework
- [Remix Auth](https://github.com/sergiodxa/remix-auth) - Authentication
- [Drizzle ORM](https://drizzle.team/) - TypeScript ORM
- [Cloudflare Pages](https://pages.dev) - Deployment Platform
- [Vercel AI SDK](sdk.vercel.ai/) -  TypeScript toolkit for building AI-powered applications
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) - Object storage
- [OpenAI](https://openai.com) with gpt-4o-mini - LLM
- [Upstash](https://upstash.com) - Redis for rate limiting
- [Langchain](https://js.langchain.com/v0.2/docs/introduction/) - Framework for developing applications powered by large language models (LLMs)

## Conclusion

While this pattern is useful in building AI applications, you can simply use it to provide each tenant with its own database. If you have any questions, feel free to reach out to the [Neon Discord](https://neon.tech/discord) or contact the [Neon Sales team](https://neon.tech/contact-sales). We'd love to hear from you.


