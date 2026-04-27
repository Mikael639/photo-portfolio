"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function AdminFeedback({ errorMessage, statusMessage }) {
  const message = errorMessage || statusMessage;
  const isError = Boolean(errorMessage);

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed right-4 top-24 z-[120] max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_60px_rgba(12,10,8,0.16)] backdrop-blur-xl md:right-8 ${
            isError
              ? "border-red-200 bg-red-50/92 text-red-800"
              : "border-emerald-200 bg-emerald-50/92 text-emerald-800"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <span className={`mt-1 h-2 w-2 rounded-full ${isError ? "bg-red-600" : "bg-emerald-600"}`} />
            <p>{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
