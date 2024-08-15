import type { InferSelectModel } from "drizzle-orm";
import {
	index,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
	vector,
} from "drizzle-orm/pg-core";

export const embeddings = pgTable(
	"embeddings",
	{
		id: serial("id").primaryKey(),
		content: text("content").notNull(),
		metadata: jsonb("metadata").notNull(),
		embedding: vector("embedding", { dimensions: 1536 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		embeddingIndex: index("embedding_idx").using(
			"hnsw",
			t.embedding.op("vector_cosine_ops"),
		),
	}),
);

export type Embedding = InferSelectModel<typeof embeddings>;
