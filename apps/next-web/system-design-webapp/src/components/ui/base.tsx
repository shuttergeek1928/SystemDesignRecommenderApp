import * as React from "react";
import { cn } from "@/lib/utils";

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            outline: "border border-border bg-transparent hover:bg-accent text-foreground",
            ghost: "hover:bg-accent text-foreground",
        };
        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
        };
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

// --- Card ---
export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("rounded-[2rem] border border-border bg-card text-card-foreground shadow-xl", className)} {...props} />
);

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            className={cn(
                "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
Input.displayName = "Input";

// --- Label ---
export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className={cn("text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 inline-block text-foreground/80", className)} {...props} />
);
