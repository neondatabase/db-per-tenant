import type React from "react";

export const ListUp = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="List up"
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
		<path d="M4 12h8m-8 6h8M4 6h16m-4 8.312a14.998 14.998 0 0 1 2.556-2.655A.704.704 0 0 1 19 11.5m3 2.812a14.998 14.998 0 0 0-2.556-2.655A.704.704 0 0 0 19 11.5m0 0v7.497" />
	</svg>
);
