"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "jp_intro_seen";

export default function IntroSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setIsVisible(false);
      return undefined;
    }

    sessionStorage.setItem(SESSION_KEY, "1");
    const leaveTimeout = window.setTimeout(() => setIsLeaving(true), 1300);
    const removeTimeout = window.setTimeout(() => setIsVisible(false), 2050);

    return () => {
      window.clearTimeout(leaveTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-paper text-ink transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isLeaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-x-[12vw] top-1/2 h-px bg-ink/8" />
      <div className="relative flex w-[min(78vw,30rem)] flex-col items-center">
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-ink/10 bg-white/35 shadow-[0_18px_60px_rgba(12,10,8,0.07)]">
          <svg
            className="h-7 w-7 animate-[loading_camera_1.8s_ease-in-out_infinite] text-ink/70"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9.4 10.5h2.9l1.5-2.1h4.4l1.5 2.1h2.9c1.7 0 3 1.3 3 3v8.2c0 1.7-1.3 3-3 3H9.4c-1.7 0-3-1.3-3-3v-8.2c0-1.7 1.3-3 3-3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M16 21.4a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M22.2 14h.1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-serif text-[clamp(2.7rem,8vw,5.8rem)] leading-none tracking-normal text-ink">
          Jerrypicsart
        </p>
        <div className="mt-8 flex w-full items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-ink/35">Chargement</span>
          <div className="h-px flex-1 overflow-hidden bg-ink/10">
            <div className="h-full w-1/3 animate-[loading_line_1.25s_ease-in-out_infinite] bg-ink" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading_line {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(360%); }
        }

        @keyframes loading_camera {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.72; }
          45% { transform: translateY(-2px) scale(1.04); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
