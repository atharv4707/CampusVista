import { cn } from "../../lib/utils";

export function Slider({
  id,
  name,
  value,
  min,
  max,
  step,
  onChange,
  className
}: {
  id?: string;
  name?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <input
        id={id}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-amber-300"
      />
      <div className="mt-1 flex justify-between text-xs text-white/50">
        <span>{min}</span>
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
