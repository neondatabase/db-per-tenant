import type React from "react";

export const Bot = (props: React.JSX.IntrinsicElements["svg"]) => {
	return (
		<svg
			{...props}
			role="img"
			aria-label="Bot"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		>
			<path d="M12 2v5m0 0h-2c-1.861 0-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21C3 11.208 3 12.139 3 14s0 2.792.245 3.545a5 5 0 0 0 3.21 3.21C7.208 21 8.139 21 10 21h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 16.792 21 15.861 21 14s0-2.792-.245-3.545a5 5 0 0 0-3.21-3.21C16.792 7 15.861 7 14 7h-2Zm-3 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
		</svg>
	);
};
