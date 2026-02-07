import * as React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none",
        "placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/20",
        className
      )}
      {...props}
    />
  );
}
