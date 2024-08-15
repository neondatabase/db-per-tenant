import type React from "react";

export const Check = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="check"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="3"
		{...props}
	>
		<path d="m4 12.374 5.351 5.346.428-.748a30.506 30.506 0 0 1 9.278-10.048L20 6.28" />
	</svg>
);
