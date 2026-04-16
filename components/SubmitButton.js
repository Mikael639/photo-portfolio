"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ idleLabel, pendingLabel, className = "" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
