export function cn(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

export function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function pct(n: number, d: number) {
  return d <= 0 ? 0 : Math.round((n / d) * 100);
}

export function occupancyBand(p: number): "normal" | "warning" | "danger" {
  if (p > 90) return "danger";
  if (p >= 70) return "warning";
  return "normal";
}

export function occupancyBandClass(p: number) {
  const band = occupancyBand(p);
  if (band === "danger") return "border-red-400/30 bg-red-500/10 text-red-200";
  if (band === "warning") return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
}
