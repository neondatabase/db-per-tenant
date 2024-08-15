import {
	DropZone as ReactAriaDropZone,
	type DropZoneProps,
} from "react-aria-components";
import { cn } from "../../lib/utils/cn";

const DropZone = ({ className, ...props }: DropZoneProps) => (
	<ReactAriaDropZone
		className={(values) =>
			cn(
				values,
				"flex flex-col gap-2 h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed border-muted text-sm data-[drop-target]:border-muted-active data-[drop-target]:bg-muted-element-hover bg-muted-element",
				className,
			)
		}
		{...props}
	/>
);

export { DropZone };
