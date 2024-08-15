import type React from "react";

export const Info = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="info"
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
		<path d="M12 12v4m0-7.375v-.001M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
	</svg>
);
