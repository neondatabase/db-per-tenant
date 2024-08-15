import createClient from "openapi-fetch";
import type { paths } from "./api-schema";

export const createNeonApiClient = (apiKey: string) => {
	return createClient<paths>({
		baseUrl: "https://console.neon.tech/api/v2/",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
	});
};
