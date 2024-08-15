import type React from "react";

export const QuestionCircle = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="question-circle"
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
		<path d="M9.281 9.719A2.719 2.719 0 1 1 13.478 12c-.724.47-1.478 1.137-1.478 2m0 3h.001M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
	</svg>
);
