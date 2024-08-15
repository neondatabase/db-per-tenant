import type React from "react";

export const CheckCircle = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="check-circle"
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
		<path d="m8.5 12.512 2.341 2.339A14.985 14.985 0 0 1 15.4 9.915l.101-.069M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
	</svg>
);
