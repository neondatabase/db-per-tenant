import type { ErrorResponse } from "@remix-run/router";

import {
	isRouteErrorResponse,
	useParams,
	useRouteError,
} from "@remix-run/react";
import { getErrorMessage } from "../../lib/utils/get-error-message";

type StatusHandler = (info: {
	error: ErrorResponse;
	params: Record<string, string | undefined>;
}) => JSX.Element | null;

type GenericErrorBoundaryProps = {
	defaultStatusHandler?: StatusHandler;
	statusHandlers?: Record<number, StatusHandler>;
	unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
};

export function GenericErrorBoundary({
	defaultStatusHandler = ({ error }) => (
		<p>
			{error.status} {error.data}
		</p>
	),
	statusHandlers,
	unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: GenericErrorBoundaryProps) {
	const error = useRouteError();
	const params = useParams();

	if (typeof document !== "undefined") {
		console.error(error);
	}

	return (
		<div className="flex h-full w-full flex-col items-center justify-center">
			{isRouteErrorResponse(error)
				? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
						error,
						params,
					})
				: unexpectedErrorHandler(error)}
		</div>
	);
}
