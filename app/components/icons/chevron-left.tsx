import type React from "react";

export const ChevronLeft = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="chevron-left"
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
		<path d="M14.125 8.14a20.357 20.357 0 0 0-3.894 3.701.472.472 0 0 0 0 .596 20.359 20.359 0 0 0 3.894 3.702" />
	</svg>
);
