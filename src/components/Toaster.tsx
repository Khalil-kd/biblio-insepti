"use client";

import { useEffect, useState } from "react";
import { subscribeToast, type ToastPayload } from "@/lib/toast-client";

interface ActiveToast extends ToastPayload {
  id: number;
}

let counter = 0;

export function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    return subscribeToast((payload) => {
      const id = counter++;
      setToasts((prev) => [...prev, { ...payload, id }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);

      const announcer = document.getElementById("a11y-announcer");
      if (announcer) announcer.textContent = payload.message;
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`surface pointer-events-auto rounded-lg px-4 py-2 text-sm shadow-md transition-opacity duration-150 ${
            t.tone === "error" ? "border-red-500/40 text-red-600 dark:text-red-300" : ""
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
