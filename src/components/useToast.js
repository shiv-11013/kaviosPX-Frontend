import { useState, useCallback } from "react";

/**
 * useToast — lightweight in-component toast notifications
 *
 * Usage:
 *   const { showToast, ToastContainer } = useToast();
 *   showToast("Saved!", "success");   // types: success | error | info
 *   return <> ... <ToastContainer /> </>
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const icon = { success: "✓", error: "✕", info: "ℹ" };

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icon[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}