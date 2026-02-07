import * as React from "react";
import { cn } from "../../lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md";
};

export function Button({ className, variant = "default", size = "md", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    default: "bg-white/10 hover:bg-white/14 border border-white/10 shadow-soft",
    ghost: "bg-transparent hover:bg-white/8",
    outline: "bg-transparent border border-white/14 hover:bg-white/8"
  };
  const sizes: Record<string, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm"
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
