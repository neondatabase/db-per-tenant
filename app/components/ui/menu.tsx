import {
	Header as ReactAriaHeader,
	Menu as ReactAriaMenu,
	MenuItem as ReactAriaMenuItem,
	MenuTrigger as ReactAriaMenuTrigger,
	Popover as ReactAriaPopover,
	Section as ReactAriaSection,
	Separator as ReactAriaSeparator,
	type MenuItemProps,
	type MenuProps,
	type MenuTriggerProps,
	type PopoverProps,
	type SectionProps,
	type SeparatorProps,
} from "react-aria-components";

import { cn } from "../../lib/utils/cn";
import { Check } from "../icons/check";

const Menu = (props: MenuTriggerProps) => {
	return <ReactAriaMenuTrigger {...props} />;
};

export interface MenuContentProps<T>
	extends Omit<PopoverProps, "children" | "style">,
		MenuProps<T> {
	className?: string;
	popoverClassName?: string;
}

const MenuContent = <T extends object>({
	className,
	popoverClassName,
	...props
}: MenuContentProps<T>) => {
	return (
		<ReactAriaPopover
			className={cn(
				// Base
				"min-w-[150px] isolate w-max rounded-xl overflow-auto border border-muted bg-muted-element p-1 backdrop-blur-xl shadow-lg ring-inset",
				// Entering
				"entering:animate-in entering:fade-in",
				// Exiting
				"exiting:animate-in exiting:fade-in exiting:direction-reverse",
				// Top
				"placement-top:slide-in-from-bottom-2",
				// Bottom
				"placement-bottom:slide-in-from-top-2",
				popoverClassName,
			)}
			{...props}
		>
			<ReactAriaMenu className={cn("outline-none", className)} {...props} />
		</ReactAriaPopover>
	);
};

const MenuItem = ({ className, children, ...props }: MenuItemProps) => {
	return (
		<ReactAriaMenuItem
			className={cn(
				"group",
				"flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-muted-base text-sm outline-none transition-colors",
				// Hover
				"hover:bg-muted-element-hover hover:text-muted-high-contrast",
				// Focus
				"focus:bg-muted-element-hover focus:text-muted-high-contrast",
				// Disabled
				"disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
				className,
			)}
			{...props}
		>
			{({ selectionMode }) => (
				<>
					{selectionMode === "multiple" ||
						(selectionMode === "single" && (
							<Check
								aria-hidden="true"
								className="invisible h-4 w-4 group-selected:visible"
							/>
						))}
					{children}
				</>
			)}
		</ReactAriaMenuItem>
	);
};

const MenuSection = <T extends object>(props: SectionProps<T>) => {
	return <ReactAriaSection {...props} />;
};

const MenuHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) => {
	return (
		<ReactAriaHeader
			className={cn(
				"px-2 py-1 text-sm font-medium text-muted-high-contrast",
				className,
			)}
			{...props}
		/>
	);
};

const MenuSeparator = ({ className, ...props }: SeparatorProps) => {
	return (
		<ReactAriaSeparator
			className={cn("-mx-1 my-1 border-t border-muted", className)}
			{...props}
		/>
	);
};

export { Menu, MenuContent, MenuSection, MenuHeader, MenuItem, MenuSeparator };
