import { Form, useLocation } from "@remix-run/react";
import { GenericErrorBoundary } from "../components/misc/error-boundary";
import { Button } from "../components/ui/button";
import { Heading } from "../components/ui/heading";

export async function loader() {
	throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
	return <ErrorBoundary />;
}

export function ErrorBoundary() {
	const location = useLocation();

	return (
		<div className="mx-auto flex h-screen w-screen max-w-7xl flex-col px-6">
			<div className="flex h-full w-full flex-col items-center justify-center">
				<GenericErrorBoundary
					statusHandlers={{
						404: () => (
							<div className="flex flex-col items-center justify-center gap-4">
								<Heading size="6xl" className="text-muted-high-contrast">
									Nothing here.
								</Heading>
								<Text className="font-medium">
									{location.pathname} not found
								</Text>
								<Form method="get" action="/">
									<Button variant="primary" type="submit">
										Go back home
									</Button>
								</Form>
							</div>
						),
					}}
				/>
			</div>
		</div>
	);
}
