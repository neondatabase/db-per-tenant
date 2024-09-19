## AI app architecture: vector database per tenant

This repo contains an example of a scalable architecture for AI-powered applications. On the surface, it's an AI app where users can upload PDFs and chat with them. However, under the hood, each user gets a dedicated vector database instance (Postgres on [Neon](https://neon.tech/?ref=github) with pgvector).

You can check out the live version at https://ai-vector-db-per-tenant.pages.dev

![Demo app](https://github.com/user-attachments/assets/d9dee48f-a6d6-4dd5-bb89-fa5d31ca26e3)

The app is built using the following technologies:

- [Neon](https://neon.tech/ref=github) - Fully managed Postgres
- [Remix](https://remix.run) - Full-stack React framework
- [Remix Auth](https://github.com/sergiodxa/remix-auth) - Authentication
- [Drizzle ORM](https://drizzle.team/) - TypeScript ORM
- [Railway](https://railway.app) - Deployment Platform
- [Vercel AI SDK](sdk.vercel.ai/) -  TypeScript toolkit for building AI-powered applications
- [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) - Object storage
- [OpenAI](https://openai.com) with gpt-4o-mini - LLM
- [Upstash](https://upstash.com) - Redis for rate limiting
- [Langchain](https://js.langchain.com/v0.2/docs/introduction/) - Framework for developing applications powered by large language models (LLMs)

## How it works

Rather than having all vector embeddings stored in a single Postgres database, you provide each tenant (a user, an organization, a workspace, or any other entity requiring isolation) with its own dedicated Postgres database instance where you can store and query its embeddings.

Depending on your application, you will provision a vector database after a specific event (e.g., user signup, organization creation, or upgrade to paid tier). You will then track tenants and their associated vector databases in your application's main database. 

This approach offers several benefits:
1. Each tenant's data is stored in a separate, isolated database not shared with other tenants. This makes it possible for you to be compliant with data residency requirements (e.g., GDPR)
2. Database resources can be allocated based on each tenant's requirements. 
3. A tenant with a large workload that can impact the database's performance won't affect other tenants; it would also be easier to manage.

Here's the database architecture diagram of the demo app that's in this repo:

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

  authenticator.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async ({ profile }) => {
			const email = profile.emails[0].value;

			try {
				const userData = await db
					.select({
						user: users,
						vectorDatabase: vectorDatabases,
					})
					.from(users)
					.leftJoin(vectorDatabases, eq(users.id, vectorDatabases.userId))
					.where(eq(users.email, email));

				if (
					userData.length === 0 ||
					!userData[0].vectorDatabase ||
					!userData[0].user
				) {
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

					const sql = postgres(vectorDbConnectionUri);

					await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

					await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });

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

				return {
					...userData[0].user,
					vectorDbId: userData[0].vectorDatabase.vectorDbId,
				};
			} catch (error) {
				console.error("User creation error:", error);
				throw new Error(getErrorMessage(error));
			}
		},
	),
);

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

	const { content: prompt } = messages[messages.length - 1];

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
		apiKey: process.env.OPENAI_API_KEY,
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
		apiKey: process.env.OPENAI_API_KEY,
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
  ```
</details>


While this approach is beneficial, it can also be challenging to implement. You need to manage each database's lifecycle, including provisioning, scaling, and de-provisioning. Fortunately, Postgres on Neon is set up differently:

1. Postgres on Neon can be provisioned via the in ~2 seconds, making provisioning a Postgres database for every tenant possible. You don't need to wait several minutes for the database to be ready.
2. The database's compute can automatically scale up to meet an application's workload and can shut down when the database is unused.

https://github.com/user-attachments/assets/96500fc3-3efa-4cfa-9339-81eb359ff105

![Autoscaling on Neon](https://github.com/user-attachments/assets/7f093ead-d51b-46bc-a473-0df483d91c18)

This makes the proposed pattern of creating a database per tenant not only possible but also cost-effective.

## Managing migrations

When you have a database per tenant, you need to manage migrations for each database. This project uses [Drizzle](https://drizzle.team/):
1. The schema is defined in `/app/lib/vector-db/schema.ts` using TypeScript.
2. Migrations are then generated by running `bun run vector-db:generate`, and stored in `/app/lib/vector-db/migrations`.
3. Finally, to migrate all databases, you can run `bun run vector-db:migrate`. This command will run a script that connects to each tenant's database and applies the migrations. 

It's important to note that any schema changes you would like to introduce should be backward-compatible. Otherwise, you would need to handle schema migrations differently.

## Conclusion

While this pattern is useful in building AI applications, you can simply use it to provide each tenant with its own database. You could also use a database other than Postgres for your main application's database (e.g., MySQL, MongoDB, MSSQL server, etc.). 

If you have any questions, feel free to reach out to in the [Neon Discord](https://neon.tech/discord) or contact the [Neon Sales team](https://neon.tech/contact-sales). We'd love to hear from you.


