import type React from "react";

export const ListDown = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="List down"
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
		<path d="M4 12h8m-8 6h8M4 6h16m-4 10.186c.74.987 1.599 1.878 2.556 2.654.13.105.287.157.444.157m3-2.811a14.998 14.998 0 0 1-2.556 2.654.704.704 0 0 1-.444.157m0 0V11.5" />
	</svg>
);
