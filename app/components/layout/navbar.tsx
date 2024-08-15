import { useSubmit } from "@remix-run/react";
import { Button as ReactAriaButton } from "react-aria-components";
import { Menu, MenuContent, MenuItem } from "../ui/menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { User } from "../../lib/db/schema";

export const Navbar = ({
	user,
}: {
	user: User | null;
}) => {
	const submit = useSubmit();

	return (
		<nav className="px-4 pb-10 pt-7">
			<div className="mx-auto flex items-center justify-between px-2 sm:px-4 lg:max-w-7xl">
				<div className="flex items-center gap-2 sm:gap-4">
					<a
						className="rounded-md focus:outline-none focus-visible:ring-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted-app"
						aria-label="Home"
						href="/"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							className="w-8 h-8"
							fill="none"
							viewBox="0 0 48 48"
						>
							<title>Logo</title>

							<linearGradient
								id="c"
								x1="24"
								x2="26"
								y1="0"
								y2="48"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0" stopColor="#fff" stopOpacity="0" />
								<stop offset="1" stopColor="#fff" stopOpacity="0.12" />
							</linearGradient>
							<linearGradient
								id="d"
								x1="24.001"
								x2="24.001"
								y1="8.959"
								y2="39.042"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0" stopColor="#fff" stopOpacity="0.8" />
								<stop offset="1" stopColor="#fff" stopOpacity="0.5" />
							</linearGradient>
							<linearGradient
								id="e"
								x1="24"
								x2="24"
								y1="0"
								y2="48"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0" stopColor="#fff" stopOpacity="0.12" />
								<stop offset="1" stopColor="#fff" stopOpacity="0" />
							</linearGradient>
							<clipPath id="f">
								<rect width="48" height="48" rx="12" />
							</clipPath>
							<g filter="url(#a)">
								<g clipPath="url(#f)">
									<rect width="48" height="48" fill="#155eef" rx="12" />
									<path fill="url(#c)" d="M0 0h48v48H0z" />
									<g filter="url(#b)">
										<circle
											cx="24.001"
											cy="24"
											r="12.667"
											stroke="url(#d)"
											strokeWidth="4.75"
										/>
									</g>
								</g>
								<rect
									width="46"
									height="46"
									x="1"
									y="1"
									stroke="url(#e)"
									strokeWidth="2"
									rx="11"
								/>
							</g>
						</svg>
					</a>
				</div>
				{user && (
					<div className="flex items-center gap-4 sm:gap-8">
						<Menu>
							<ReactAriaButton
								className="rounded-full focus:outline-none focus-visible:ring-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[focus-visible]:ring-offset-muted-app"
								aria-label="Menu"
							>
								<Avatar>
									<AvatarImage src={user?.avatarUrl ?? undefined} />
									<AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
								</Avatar>
							</ReactAriaButton>
							<MenuContent placement="bottom right">
								<MenuItem
									isDisabled
									className=" disabled:cursor-default disabled:opacity-100"
								>
									{user.email}
								</MenuItem>

								<MenuItem
									onAction={() => {
										submit("", {
											method: "POST",
											action: "/api/auth/logout",
										});
									}}
								>
									Logout
								</MenuItem>
							</MenuContent>
						</Menu>
					</div>
				)}
			</div>
		</nav>
	);
};
