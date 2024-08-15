import {
	Input as ReactAriaInput,
	type InputProps,
	DateInput as ReactAriaDateInput,
	type DateInputProps,
	DateSegment,
} from "react-aria-components";
import { cn } from "../../lib/utils/cn";

const Input = ({ className, type = "text", ...props }: InputProps) => {
	return (
		<span
			className={cn(
				// Basic layout
				"relative block w-full",

				// Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
				"before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",

				// Focus ring
				"after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2",

				// Disabled state
				"has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-black/5 before:has-[[data-disabled]]:shadow-none",

				// Invalid state
				"before:has-[[data-invalid]]:shadow-red-500/10",
			)}
		>
			<ReactAriaInput
				type={type}
				className={cn(
					// Basic layout
					"relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] transition-colors",

					// Typography
					"text-base/6 text-muted-high-contrast placeholder:text-muted-base sm:text-sm/6",

					// Border
					"border border-muted hover:border-muted-hover",

					// Background color
					"bg-muted-element",

					// Invalid state
					"data-[invalid]:border-danger data-[invalid]:hover:border-danger-hover",

					// Disabled state
					"data-[disabled]:border-muted/50 data-[disabled]:70",

					// Focus styles
					"focus:outline-none focus-visible:ring-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted-app",
					className,
				)}
				{...props}
			/>
		</span>
	);
};

const DateInput = (props: Omit<DateInputProps, "children">) => {
	return (
		<ReactAriaDateInput
			className={cn(
				"relative block w-max appearance-none rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] transition-colors",

				// Typography
				"text-base/6 text-muted-high-contrast placeholder:text-muted-base sm:text-sm/6",

				// Border
				"border border-muted hover:border-muted-hover",

				// Background color
				"bg-muted-element",

				// Invalid state
				"data-[invalid]:border-danger data-[invalid]:hover:border-danger-hover",

				// Disabled state
				"data-[disabled]:border-muted/50 data-[disabled]:70",

				// Focus styles
				"focus:outline-none focus-visible:ring-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted-app",
				props.className,
			)}
			{...props}
		>
			{(segment) => (
				<DateSegment
					segment={segment}
					className={cn(
						"inline p-0.5 type-literal:px-0 rounded outline outline-0 forced-color-adjust-none caret-transparent text-muted-base data-[focused]:bg-primary-solid data-[focused]:text-white",
					)}
				/>
			)}
		</ReactAriaDateInput>
	);
};

export { Input, DateInput };
