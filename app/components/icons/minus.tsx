import type React from "react";

export const Minus = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="minus"
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
		<path d="M5 12h14" />
	</svg>
);
