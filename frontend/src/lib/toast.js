let listeners = [];
const notify = (toastEvent) => {
  listeners.forEach((listener) => listener(toastEvent));
};

export const toast = {
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  show: (message, type = "info", options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    notify({ id, message, type, ...options });
    return id;
  },
  success: (message, options) => toast.show(message, "success", options),
  error: (message, options) => toast.show(message, "error", options),
  warning: (message, options) => toast.show(message, "warning", options),
  info: (message, options) => toast.show(message, "info", options),
};
