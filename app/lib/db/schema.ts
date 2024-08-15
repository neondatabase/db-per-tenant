import type { InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	numeric,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		userId: varchar("user_id", { length: 256 }).notNull().unique(),
		name: varchar("name", { length: 32 }),
		email: varchar("email", { length: 255 }).notNull().unique(),
		avatarUrl: text("avatar_url"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		userIdIdx: index("user_id_idx").on(t.userId),
	}),
);

export type User = InferSelectModel<typeof users>;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const documents = pgTable(
	"documents",
	{
		id: serial("id").primaryKey(),
		documentId: varchar("document_id", { length: 256 }).notNull().unique(),
		userId: serial("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 255 }).notNull(),
		fileName: text("file_name").notNull(),
		fileSize: numeric("file_size").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		documentIdIdx: index("document_id_idx").on(t.documentId),
	}),
);

export type Document = InferSelectModel<typeof documents>;

export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);

export const chats = pgTable(
	"chats",
	{
		id: serial("id").primaryKey(),
		chatId: varchar("chat_id", { length: 256 }).notNull().unique(),
		userId: serial("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		documentId: serial("document_id")
			.notNull()
			.references(() => documents.id),
		chatData: jsonb("chat_data").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		userDocumentIdx: index("user_document_idx").on(t.userId, t.documentId),
		chatIdIdx: index("chat_id_idx").on(t.chatId),
	}),
);

export type Chat = InferSelectModel<typeof chats>;

export const insertChatSchema = createInsertSchema(chats);
export const selectChatSchema = createSelectSchema(chats);

export const vectorDatabases = pgTable(
	"vector_databases",
	{
		id: serial("id").primaryKey(),
		vectorDbId: varchar("vector_db_id", { length: 256 }).notNull().unique(),
		userId: serial("user_id")
			.notNull()
			.references(() => users.id)
			.unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		vectorDbIdIdx: index("vector_db_id_idx").on(t.vectorDbId),
	}),
);

export type VectorDatabase = InferSelectModel<typeof vectorDatabases>;

export const insertVectorDatabaseSchema = createInsertSchema(vectorDatabases);
export const selectVectorDatabaseSchema = createSelectSchema(vectorDatabases);
