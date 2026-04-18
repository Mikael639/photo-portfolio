export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--paper)] text-[var(--ink)] transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-50 animate-pulse">
          Jerrypicsart
        </span>
        <div className="flex gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] opacity-30 animate-ping" style={{ animationDelay: '0ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] opacity-50 animate-ping" style={{ animationDelay: '150ms' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] opacity-70 animate-ping" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
