import type React from "react";

export const Plus = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="plus"
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
		<path d="M12 19v-7m0 0V5m0 7H5m7 0h7" />
	</svg>
);
