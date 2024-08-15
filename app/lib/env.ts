import { z } from "zod";

export const EnvSchema = z.object({
	DATABASE_URL: z.string(),
	// Neon
	NEON_API_KEY: z.string(),
	// Auth
	SESSION_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	GOOGLE_CALLBACK_URL: z.string().url(),
	// Cloudflare R2
	CLOUDFLARE_R2_ENDPOINT: z.string().url(),
	CLOUDFLARE_R2_ACCESS_ID: z.string(),
	CLOUDFLARE_R2_SECRET_KEY: z.string(),
	CLOUDFLARE_R2_BUCKET_NAME: z.string(),
	CLOUDFLARE_R2_ACCOUNT_ID: z.string(),

	// Upstash
	UPSTASH_REDIS_REST_URL: z.string(),
	UPSTASH_REDIS_REST_TOKEN: z.string(),

	OPENAI_API_KEY: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;
