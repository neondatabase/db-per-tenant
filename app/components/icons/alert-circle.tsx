import type React from "react";

export const AlertCircle = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="alert-circle"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		{...props}
	>
		<path d="M12 13V8m0 8.375v.001M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" />
	</svg>
);
