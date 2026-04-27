export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(90deg,var(--ink)_1px,transparent_1px),linear-gradient(180deg,var(--ink)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative flex w-[min(78vw,28rem)] flex-col items-center gap-7">
        <div className="h-24 w-20 overflow-hidden rounded-[0.8rem] border border-ink/12 bg-ink/5 shadow-[0_24px_80px_rgba(12,10,8,0.08)]">
          <div className="h-full w-full animate-[loading_shutter_1.4s_ease-in-out_infinite] bg-[linear-gradient(180deg,rgba(12,10,8,0.08),rgba(12,10,8,0.22),rgba(12,10,8,0.05))]" />
        </div>
        <div className="w-full text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-ink/55">Jerrypicsart</p>
          <div className="mt-5 h-px overflow-hidden bg-ink/10">
            <div className="h-full w-1/2 animate-[loading_line_1.15s_ease-in-out_infinite] bg-ink/70" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading_line {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(240%); }
        }

        @keyframes loading_shutter {
          0%, 100% { transform: translateY(-55%); opacity: 0.45; }
          50% { transform: translateY(55%); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
