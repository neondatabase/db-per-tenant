import type React from "react";

export const User = (props: React.JSX.IntrinsicElements["svg"]) => {
	return (
		<svg
			{...props}
			role="img"
			aria-label="User"
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
			<path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
			<path d="M5.866 21h12.268c1.03 0 1.866-.835 1.866-1.866 0-3.084-2.94-5.32-5.911-4.495l-.696.193a5.216 5.216 0 0 1-2.786 0l-.696-.193C6.94 13.815 4 16.05 4 19.134 4 20.164 4.835 21 5.866 21Z" />
		</svg>
	);
};
