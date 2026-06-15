import { useEffect, useState, useRef, useCallback } from "react";
import { IoAlertCircle } from "react-icons/io5";

/**
 * FieldError — Subtle, auto-dismissing error indicator for form fields.
 *
 * Shows a compact inline error below an input with a smooth slide-in
 * animation. Automatically fades out after ~2.5 s so the page never
 * stays littered with stale error messages.
 *
 * @param {string}  message   - Error text to display
 * @param {string}  [id]      - Optional HTML id for aria-describedby linking
 * @param {function} [onDismiss] - Called after exit animation completes so
 *                                 the parent can clear stale error state
 * @param {boolean} [persistent] - When true, error stays until parent clears
 *                                 the message (no auto-dismiss)
 */
export default function FieldError({ message, id, onDismiss, persistent }) {
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
    // Reset whenever message changes
    clearTimer();
    if (!message) {
      setVisible(false);
      setExiting(false);
      return;
    }

    // Trigger enter
    setVisible(true);
    setExiting(false);

    // Schedule exit after 2.5 s (skip when persistent)
    if (!persistent) {
      timerRef.current = setTimeout(() => {
        setExiting(true);
      }, 2500);
    }

    return clearTimer;
  }, [message, clearTimer, persistent]);

  // After exit animation completes (300 ms), remove the element + notify parent
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      setVisible(false);
      onDismissRef.current?.();
    }, 300);
    return () => clearTimeout(t);
  }, [exiting]);

  if (!visible && !exiting) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`field-error ${exiting ? "field-error--exit" : "field-error--enter"}`}
    >
      <IoAlertCircle className="field-error__icon" aria-hidden="true" />
      <span className="field-error__text">{message}</span>
    </div>
  );
}
