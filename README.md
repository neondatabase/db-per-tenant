# AI vector database per tenant

## Background: Retrieval-Augmented Generation (RAG)

Large-language models (LLMs) have significantly improved in all aspects: they now provide better and faster responses, have larger context windows, and can interact with external tools.

We've also seen the rise of Retrieval-Augmented Generation (RAG), an architecture that enables LLMs to give more accurate responses. Here's an overview of how it works.

![RAG Overview](https://github.com/user-attachments/assets/9254d4c4-8c06-4b37-ba68-af0af1139c7b)

You first need to ingest your unstructured data and convert it into vector embeddings, a mathematical representation that can capture the meaning of text strings and allow you to measure their relatedness. 

You can then store those embeddings in a vector database, where you can later retrieve relevant data by comparing them against an input vector embedding. If your dataset is dynamic, then you can generate embeddings before storing the data in your application's database.

Once that's implemented, when a user sends a prompt, you convert it into a vector embedding, retrieve relevant data from the vector database, and then pass that additional context to the LLM so that you can improve its response.

Fortunately, Postgres supports vector columns and similarity search operations through the use of the pgvector extension. Here's everything you need to do: 

```sql
-- Enable the extension
CREATE EXTENSION vector;

-- Create a table called `documents` where the document data is stored along with the embedding
CREATE table documents(id integer, content text, embedding vector(1536));

-- Find the 5 most similar documents to a given embedding vector and return them in order of similarity. 
SELECT * from documents order by embedding <-> '[0.2,0.3,0.4]'::VECTOR(1536) LIMIT 5;
```

However, as the number of embeddings grows, querying performance can degrade. So, does this mean that you shouldn't use Postgres if you expect your app to scale? We believe you _should_ use Postgres, but while adopting a different architecture.

## Making Postgres scalable for AI apps: vector database per tenant

Rather than having all vector embeddings stored in a single Postgres database, you give each tenant (could be a user, an organization, a workspace, or any other entity requiring isolation) its own dedicated vector database instance.

You will then need to keep track of the different tenants and the vector databases that belong to them in your application's database. Here's an example architecture of the demo app that's included in this repo

![Example architecture](https://github.com/user-attachments/assets/86a59c8c-5c75-4e8f-ba66-9fdd41f05bb3)

Whenever you create a tenant, you will provision a database and set up the necessary schema for storing embeddings.

This approach offers several benefits:
1. Each tenant's data is stored in a separate, isolated database that is not shared with other tenants. This makes it possible for you to be compliant with data residency requirements (e.g., GDPR)
2. Database resources can be allocated based on each tenant's requirements. 
3. A tenant with a large workload that can impact the database's performance won't affect other tenants; it would also be easier to manage.

While this approach is beneficial, it can also be challenging to implement. You need to manage each database's lifecycle, including provisioning, scaling, and de-provisioning. Fortunately, Postgres on Neon is set up differently.

## A Postgres database per tenant on Neon

Postgres on Neon can be provisioned in ~2 seconds, making provisioning a Postgres database for every tenant possible. You wouldn't need to wait several minutes for the database to be ready.

https://github.com/user-attachments/assets/96500fc3-3efa-4cfa-9339-81eb359ff105

The database's compute can automatically scale up to meet an application's workload and can shut down when the database is unused.

![image](https://github.com/user-attachments/assets/7f093ead-d51b-46bc-a473-0df483d91c18)

This makes the proposed pattern of creating a database per tenant cost-effective.

## Example app in action

![Demo app](https://github.com/user-attachments/assets/11b13120-37b8-41a5-b26b-3974abc75ea4)

You can check out the [live version](https://ai-vector-db-per-tenant.pages.dev/) of the demo app that's in this repo. On the surface, it's an app where users can upload PDFs and chat with them. However, under the hood, each user gets a dedicated vector database instance. It's built using the following technologies:

Tech stack:
- [Neon](https://neon.tech/ref=github) - Fully managed Postgres
- [Remix](https://remix.run) - full-stack React framework
- [Remix Auth](https://github.com/sergiodxa/remix-auth) - authentication
- [Drizzle ORM](https://drizzle.team/) - TypeScript ORM
- [Cloudflare Pages](https://pages.dev) - Deployment Platform
- [Vercel AI SDK](sdk.vercel.ai/) -  TypeScript toolkit for building AI-powered applications
- [Langchain](https://js.langchain.com/v0.2/docs/introduction/) - a framework for developing applications powered by large language models (LLMs)

## Conclusion

While this pattern is useful in building AI applications, you can simply use it to provide each tenant with its own database. 


