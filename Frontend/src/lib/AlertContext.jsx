import { createContext, useContext, useState, useCallback } from "react";
import { IoWarningOutline, IoClose } from "react-icons/io5";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showAlert = useCallback((message, { type = "error" } = {}) => {
    return new Promise((resolve) => {
      setModal({ kind: "alert", message, type, resolve });
    });
  }, []);

  const showConfirm = useCallback((message, { type = "warning" } = {}) => {
    return new Promise((resolve) => {
      setModal({ kind: "confirm", message, type, resolve });
    });
  }, []);

  const showPrompt = useCallback((message, { defaultValue = "" } = {}) => {
    return new Promise((resolve) => {
      setModal({ kind: "prompt", message, type: "info", resolve, defaultValue });
    });
  }, []);

  const close = (value) => {
    modal?.resolve(value);
    setModal(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {modal && <AlertModal modal={modal} onClose={close} />}
    </AlertContext.Provider>
  );
}

function AlertModal({ modal, onClose }) {
  const [promptValue, setPromptValue] = useState(modal.defaultValue || "");

  return (
    <div
      className="custom-alert-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose(modal.kind === "confirm" ? false : modal.kind === "prompt" ? null : undefined);
        }
      }}
    >
      <div className="custom-alert-modal" role="alertdialog" aria-modal="true">
        {/* Top red accent bar */}
        <div className="custom-alert-accent" />

        {/* Diagonal noise texture */}
        <div className="custom-alert-noise" />

        {/* Close button */}
        <button
          onClick={() => onClose(modal.kind === "confirm" ? false : modal.kind === "prompt" ? null : undefined)}
          className="custom-alert-close"
          aria-label="Close"
        >
          <IoClose className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="custom-alert-body">
          {/* Icon */}
          <div className="custom-alert-icon">
            <IoWarningOutline className="h-6 w-6" />
          </div>

          {/* Message */}
          <p className="custom-alert-message">
            {modal.message}
          </p>

          {/* Prompt input */}
          {modal.kind === "prompt" && (
            <input
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="custom-alert-input"
              placeholder="Type here..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onClose(promptValue);
              }}
            />
          )}

          {/* Buttons */}
          <div className="custom-alert-actions">
            {modal.kind === "alert" && (
              <button
                onClick={() => onClose(undefined)}
                className="custom-alert-btn custom-alert-btn--primary"
                autoFocus
              >
                OK
              </button>
            )}

            {modal.kind === "confirm" && (
              <>
                <button
                  onClick={() => onClose(false)}
                  className="custom-alert-btn custom-alert-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onClose(true)}
                  className="custom-alert-btn custom-alert-btn--primary"
                  autoFocus
                >
                  Confirm
                </button>
              </>
            )}

            {modal.kind === "prompt" && (
              <>
                <button
                  onClick={() => onClose(null)}
                  className="custom-alert-btn custom-alert-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onClose(promptValue)}
                  className="custom-alert-btn custom-alert-btn--primary"
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside <AlertProvider>");
  return ctx;
}
