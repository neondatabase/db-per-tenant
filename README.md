# AI vector database per tenant

## Background: Retrieval-Augmented Generation (RAG)

Large-Language Models (LLMs) have significantly improved in all aspects: better and faster responses, larger context windows, and have gained the ability to interact with external tools.

We've also seen the rise of Retrieval-Augmented Generation (RAG), an architecture that enables LLMs to give more accurate responses. In case you're unfamiliar, here's an overview of how it works.

// diagram 

You first need to ingest your unstructured data and convert it into vector embeddings, a mathematical representation that can capture the meaning of text strings and allow you to measure their relatedness. 

You can then store those embeddings in a vector database, where you can later retrieve relevant data by comparing them against an input vector embedding. If your dataset is dynamic, then you can generate embeddings before storing the data in your application's database

Once that's implemented, when a user sends a prompt, you convert it into a vector embedding, retrieve relevant data from the vector database, and then pass that additional context to the LLM so that you can improve its response.

Fortunately, Postgres supports vector columns and similarity search operations through the use of the pgvector extension. Here's everything you need to do: 

```sql
-- Enable the extension
CREATE EXTENSION vector;

-- Create a table called `documents` where the document data is stored along with the embedding
CREATE table documents(id integer, content text, embedding vector(1536));

-- Find the 5 most similar documents to a given embedding vector and return them in order of their similarity. 
SELECT * from documents order by embedding <-> '[0.2,0.3,0.4]'::VECTOR(1536) LIMIT 5;
```

However, as the number of embeddings grows, the querying performance can degrade. So does this mean that you *shouldn't* use Postgres if you expect your app to scale? We believe you *should* use Postgres, but while adopting a different architecture.


## Making Postgres scalable for AI apps: vector database per tenant

Rather than having all vector embeddings stored in a single Postgres database, you give each tenant (could be a user, an organization, a workspace, or any other entity that requires isolation) its own dedicated vector database instance.

You will then need to keep track of the different tenants and the vector databases that belong to them in your application's database. 

// diagram 

Every time you create a tenant, you will provision a database and set up the necessary database schema for storing embeddings.

This approach offers several benefits:
1. Each tenant's data is stored in a separate, isolated database that is not shared with other tenants. This makes it possible for you to be compliant with data residency requirements (e.g., GDPR)
2. Database resources can be allocated based on each tenant's requirements. 
3. A tenant with a large workload that can impact the database's performance won't affect other tenants; it would also be easier to manage.

While this approach is beneficial, it can also be challenging to implement. You need to manage the lifecycle of each database, including provisioning, scaling, and deprovisioning. Fortunately, Postgres on Neon is set up differently.

## A Postgres database per tenant on Neon

Postgres on Neon can be provisioned in ~2 seconds, making the process of provisioning a Postgres database for every tenant possible.

// instant Postgres GIF

The database's compute can automatically scale up to meet an application's workload and can shut down when the database is unused.

// Autoscaling graph

This makes the proposed pattern of creating a database per tenant viable.


## Example app in action



## Conclusion


