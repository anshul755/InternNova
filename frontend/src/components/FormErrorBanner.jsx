import { useEffect, useState, useRef, useCallback } from "react";
import { IoAlertCircle } from "react-icons/io5";

/**
 * FormErrorBanner — Auto-dismissing error banner for the top of a form.
 *
 * Use this when you have a general form-level error (e.g. "Login failed")
 * rather than a field-specific error. Disappears after ~2.5 s so stale
 * error messages don't linger on the page.
 *
 * @param {string}   message    - Error text to display
 * @param {string}   [id]       - Optional HTML id
 * @param {function} [onDismiss] - Called after exit animation so the parent
 *                                 can clear stale error state
 * @param {boolean}  [persistent] - When true the banner stays until the
 *                                  parent clears the error (no auto-dismiss)
 * @param {React.ReactNode} [children] - Optional extra content (buttons, links)
 */
export default function FormErrorBanner({ message, id, onDismiss, persistent, children }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (!message) {
      setVisible(false);
      setExiting(false);
      return;
    }

    setVisible(true);
    setExiting(false);

    if (!persistent) {
      timerRef.current = setTimeout(() => {
        setExiting(true);
      }, 2500);
    }

    return clearTimer;
  }, [message, clearTimer, persistent]);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      setVisible(false);
      onDismissRef.current?.();
    }, 350);
    return () => clearTimeout(t);
  }, [exiting]);

  if (!visible && !exiting) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`form-error-banner ${exiting ? "form-error-banner--exit" : "form-error-banner--enter"}`}
    >
      <IoAlertCircle className="form-error-banner__icon" aria-hidden="true" />
      <span>{message}</span>
      {children}
    </div>
  );
}
