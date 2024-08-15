import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
	const { filename }: { filename: string } = await request.json();

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
