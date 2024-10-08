import type React from "react";

export const ChatBubble = (props: React.JSX.IntrinsicElements["svg"]) => (
	<svg
		role="img"
		aria-label="chat-bubble"
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
		<path d="M16.193 18.866c.143 0 .306.012.632.036l1.938.138c.771.055 1.157.083 1.446-.054.253-.12.457-.324.577-.577.137-.289.11-.675.054-1.446l-.138-1.938a10.8 10.8 0 0 1-.036-.632c-.002-.232-.005-.15.013-.38.01-.143.088-.685.24-1.768A8.1 8.1 0 0 0 5.642 7.5m8.159 8.1a5.4 5.4 0 1 0-10.733.856c.096.6.144.9.152.992.012.139.011.108.01.247 0 .093-.008.204-.023.428l-.1 1.385c-.036.515-.055.772.037.965a.81.81 0 0 0 .385.384c.192.092.45.073.964.037l1.385-.1a6.97 6.97 0 0 1 .428-.024c.14 0 .108-.001.247.011.093.008.393.056.992.152a5.387 5.387 0 0 0 4.893-1.745 5.38 5.38 0 0 0 1.363-3.588Z" />
	</svg>
);
