import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const safarButtonVariants = cva(
  "text-safar-button-md inline-flex items-center justify-center gap-2 rounded-safar-md shadow-safar-sm transition-all duration-300 ease-safar hover:-translate-y-0.5 hover:shadow-safar-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary: "bg-ocean-blue text-white hover:bg-ocean-blue/90",
        secondary: "bg-sun-gold text-ink hover:bg-sun-gold/90",
        outline: "border-2 border-ocean-blue bg-transparent text-ocean-blue hover:bg-ocean-blue/5",
      },
      size: {
        small: "h-9 px-4",
        medium: "h-12 px-6",
        large: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  }
);

export interface SafarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof safarButtonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const SafarButton = React.forwardRef<HTMLButtonElement, SafarButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(safarButtonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </Comp>
    );
  }
);
SafarButton.displayName = "SafarButton";

export { safarButtonVariants };
