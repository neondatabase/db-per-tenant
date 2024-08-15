import {
	Checkbox as ReactAriaCheckbox,
	CheckboxGroup as ReactAriaCheckboxGroup,
	type CheckboxProps,
} from "react-aria-components";
import { cn } from "../../lib/utils/cn";
import { Check } from "../icons/check";
import { Minus } from "../icons/minus";

const CheckboxGroup = ReactAriaCheckboxGroup;

const Checkbox = ({ className, children, ...props }: CheckboxProps) => (
	<ReactAriaCheckbox
		className={(values) =>
			cn(
				values,
				"group inline-flex focus:outline-none items-center gap-x-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				className,
			)
		}
		{...props}
	>
		{(values) => (
			<>
				<div
					className={cn(
						// Base styles
						"p-[1px] relative isolate flex size-[1.125rem] items-center justify-center rounded-[0.3125rem] sm:size-4 shrink-0 bg-muted-element transition-colors hover:border-muted-hover border border-muted",
						// Focus styles
						"group-data-[focus-visible]:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-primary group-data-[focus-visible]:ring-offset-2 ring-offset-muted-app",
						// Selected styles
						"group-data-[indeterminate]:bg-primary-solid group-data-[selected]:hover:border-muted group-data-[selected]:bg-primary-solid group-data-[indeterminate]:text-white group-data-[selected]:text-white",
					)}
				>
					{values.isIndeterminate ? (
						<Minus className="h-[0.875rem] w-[0.875rem]" />
					) : values.isSelected ? (
						<Check className="h-4 w-[0.875rem]" />
					) : null}
				</div>
				{typeof children === "function" ? children(values) : children}
			</>
		)}
	</ReactAriaCheckbox>
);

export { Checkbox, CheckboxGroup };
