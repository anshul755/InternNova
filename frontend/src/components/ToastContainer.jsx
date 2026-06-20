import React, { useEffect, useState } from "react";
import { IoCheckmarkCircle, IoWarning, IoAlertCircle, IoInformationCircle, IoClose } from "react-icons/io5";
import { toast } from "../lib/toast.js";

const TOAST_ICONS = {
  success: IoCheckmarkCircle,
  warning: IoWarning,
  error: IoAlertCircle,
  info: IoInformationCircle,
};

const TOAST_CLASSES = {
  success: "toast-success",
  warning: "toast-warning",
  error: "toast-error",
  info: "toast-info",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, { ...newToast, duration: newToast.duration || 5000 }]);
    });
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-5 sm:top-5 z-[10000] flex flex-col gap-3 w-auto max-w-none sm:max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);
  const Icon = TOAST_ICONS[toast.type] || IoInformationCircle;

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, toast.duration);

    return () => clearTimeout(dismissTimer);
  }, [toast.duration]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300); // Wait for fade-out transition
  };

  return (
    <div
      className={`toast-item pointer-events-auto ${TOAST_CLASSES[toast.type]} ${
        exiting ? "toast-exit" : "toast-enter"
      }`}
      role="alert"
    >
      <div className="toast-accent" />
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          <Icon className="h-5 w-5" />
        </div>
        <div className="toast-body">
          {toast.title && <h4 className="toast-title">{toast.title}</h4>}
          <p className="toast-message">{toast.message}</p>
          {toast.code && <span className="toast-code">Code: {toast.code}</span>}
        </div>
        <button onClick={handleClose} className="toast-close-btn" aria-label="Close">
          <IoClose className="h-4 w-4" />
        </button>
      </div>
      <div className="toast-progress-bar" style={{ animationDuration: `${toast.duration}ms` }} />
    </div>
  );
}
