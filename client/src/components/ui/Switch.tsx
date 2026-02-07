import { cn } from "../../lib/utils";

export function Switch({
  checked,
  onCheckedChange
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full border border-white/12 transition",
        checked ? "bg-emerald-400/20" : "bg-white/6"
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white/80 transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}
