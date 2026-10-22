import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "info" | "party" | "coffee";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; type?: ToastType; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return fallback if used outside provider so it never crashes
    return {
      toast: (opts: { title: string; description?: string; type?: ToastType }) => {
        console.log("Toast:", opts.title, opts.description);
      },
    };
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      type = "success",
      duration = 4200,
    }: {
      title: string;
      description?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex max-w-sm flex-col gap-3 p-2 sm:bottom-6 sm:right-6 sm:max-w-md"
      >
        {toasts.map((t) => {
          const isParty = t.type === "party";
          const isCoffee = t.type === "coffee";

          return (
            <div
              key={t.id}
              role="alert"
              className="pointer-events-auto relative flex w-full items-start gap-3.5 overflow-hidden rounded-xl border border-caramel/40 bg-bean-900/95 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-4"
              style={{
                boxShadow: isParty
                  ? "0 12px 32px rgba(114, 47, 55, 0.4), 0 0 18px rgba(194, 160, 90, 0.25)"
                  : "0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(194, 160, 90, 0.18)",
              }}
            >
              {/* Amber glow strip */}
              <div
                className="absolute top-0 bottom-0 left-0 w-1.5"
                style={{
                  background: isParty
                    ? "linear-gradient(to bottom, #ff6e8b, #c2a05a)"
                    : "linear-gradient(to bottom, #c2a05a, #e39a45)",
                }}
              />

              {/* Icon badge */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-caramel/30 bg-bean-800 text-lg shadow-inner">
                {isParty ? "🎉" : isCoffee ? "☕" : "✨"}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-bold tracking-wide text-foam">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-1 text-xs leading-relaxed text-latte/80">
                    {t.description}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded-md p-1 text-dune transition-colors hover:bg-bean-800 hover:text-foam"
                aria-label="Dismiss notification"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Subtle animated timer bar */}
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-caramel to-amber-300 opacity-60"
                style={{
                  width: "100%",
                  animation: `toastCountdown ${t.duration || 4200}ms linear forwards`,
                }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
