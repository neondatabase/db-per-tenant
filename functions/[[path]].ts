import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../build/server";
import { getLoadContext } from "../load-context";

export const onRequest = createPagesFunctionHandler({
	build,
	getLoadContext,
	mode: build.mode,
});
