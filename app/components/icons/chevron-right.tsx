import type React from "react";

export const ChevronRight = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="chevron-right"
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
		<path d="M10 8.14a20.351 20.351 0 0 1 3.894 3.701.472.472 0 0 1 0 .596A20.353 20.353 0 0 1 10 16.139" />
	</svg>
);
