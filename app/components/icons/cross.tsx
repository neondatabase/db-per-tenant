import type React from "react";

export const Cross = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		aria-label="cross"
		role="img"
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
		<path d="m6 18 6-6m0 0 6-6m-6 6L6 6m6 6 6 6" />
	</svg>
);
