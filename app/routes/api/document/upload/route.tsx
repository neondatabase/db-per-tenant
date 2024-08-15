import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { documents } from "../../../../lib/db/schema";
import { count, eq } from "drizzle-orm";
import { MAX_FILE_COUNT, MAX_FILE_SIZE } from "../../../../lib/constants";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

export const action = async ({ context, request }: ActionFunctionArgs) => {
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

	const userDocuments = await context.db
		.select({ count: count() })
		.from(documents)
		.where(eq(documents.userId, user.id));

	const userDocumentCount = userDocuments[0].count;

	if (userDocumentCount >= MAX_FILE_COUNT) {
		return json(
			{
				error: "You have reached the maximum limit of 3 documents",
			},
			403,
		);
	}

	const { filename, fileSize }: { filename: string; fileSize: number } =
		await request.json();

	// Check if the file size exceeds the limit
	if (fileSize > MAX_FILE_SIZE) {
		return json(
			{
				error: "File size exceeds the maximum limit of 10 MB",
			},
			413, // 413 Payload Too Large
		);
	}

	try {
		const key = `${filename.split(".").slice(0, -1).join(".")}-${crypto.randomUUID()}.${filename.split(".").pop()}`; // e.g "file-usr_oahdfhj.pdf"

		const url = await getSignedUrl(
			new S3Client({
				region: "auto",
				endpoint: `https://${context.cloudflare.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: context.cloudflare.env.CLOUDFLARE_R2_ACCESS_ID,
					secretAccessKey: context.cloudflare.env.CLOUDFLARE_R2_SECRET_KEY,
				},
			}),
			new PutObjectCommand({
				Bucket: context.cloudflare.env.CLOUDFLARE_R2_BUCKET_NAME,
				Key: key,
				ContentLength: fileSize, // Set the expected content length
			}),
			{
				expiresIn: 600, // 10 minutes
			},
		);
		return json({
			url,
			title: filename,
			filename: key,
		});
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
