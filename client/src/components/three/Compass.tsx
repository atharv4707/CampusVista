export function Compass() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20">
      <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 shadow-sm">
        <div className="text-[10px] text-white/55">Compass</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-white">N</span>
          <span className="text-white/40">E</span>
          <span className="text-white/40">S</span>
          <span className="text-white/40">W</span>
        </div>
      </div>
    </div>
  );
}
