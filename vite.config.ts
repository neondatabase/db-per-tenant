import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { flatRoutes } from "remix-flat-routes";
import { getLoadContext } from "./load-context";

export default defineConfig({
	plugins: [
		remixCloudflareDevProxy({ getLoadContext }),
		remix({
			routes: async (defineRoutes) => {
				return flatRoutes("routes", defineRoutes);
			},
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
		}),
		tsconfigPaths(),
	],
	server: {
		port: 3000,
	},
});
