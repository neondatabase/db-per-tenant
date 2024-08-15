import { Toaster as Sonner } from "sonner";
import { toast } from "sonner";
import { AlertTriangle } from "../icons/alert-triangle";
import { Info } from "../icons/info";
import { Check } from "../icons/check";
import { AlertCircle } from "../icons/alert-circle";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="dark"
			className="toaster group"
			icons={{
				success: <Check className="w-4 h-4" />,
				info: <Info className="w-4 h-4" />,
				warning: <AlertTriangle className="w-4 h-4" />,
				error: <AlertCircle className="w-4 h-4" />,
			}}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-muted-app-subtle group-[.toaster]:text-muted-base group-[.toaster]:border-transparent group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-base",
					actionButton:
						"group-[.toast]:bg-muted-element group-[.toast]:text-muted-base group-[.toast]:hover:bg-muted-element-hover group-[.toast]:hover:text-muted-high-contrast  group-[.toast]:cursor-default",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster, toast };
