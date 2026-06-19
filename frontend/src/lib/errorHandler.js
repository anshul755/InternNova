import { toast } from "./toast.js";

export const errorHandler = {
  /**
   * Handle any type of error and display it using the toast system.
   * Parses missing fields, API errors, validation errors, and network errors.
   *
   * @param {Error|object|string} error - The error to handle
   * @param {object} [options] - Additional options
   * @param {string} [options.fallbackMessage] - Custom fallback message
   * @param {string} [options.title] - Custom toast title
   * @param {string} [options.type] - Toast type override ('error', 'warning', 'info', 'success')
   */
  handle: (error, options = {}) => {
    console.error("[errorHandler]", error);

    let message = options.fallbackMessage || "An unexpected error occurred.";
    let code = null;
    let status = null;
    let type = options.type || "error";
    let title = options.title || "Error";

    if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object") {
      status = error.status || null;
      code = error.code || null;

      if (error.message) {
        message = error.message;
      }

      // Check for specific field validation / Zod-like errors
      if (error.errors && Array.isArray(error.errors)) {
        title = options.title || "Validation Error";
        type = options.type || "warning";
        message = error.errors
          .map((e) => e.defaultMessage || e.message || `${e.field || "Field"} is invalid`)
          .join(", ");
      } else if (error.errors && typeof error.errors === "object") {
        title = options.title || "Validation Error";
        type = options.type || "warning";
        message = Object.entries(error.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
      } else if (message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("networkerror")) {
        title = "Connection Error";
        message = "Failed to connect to the server. Please check your internet connection.";
      }
    }

    // Format the display message nicely
    let displayMessage = message;
    if (status) {
      displayMessage = `[${status}] ${displayMessage}`;
    }

    toast.show(displayMessage, type, { title, code });
  },

  success: (message, options = {}) => {
    toast.success(message, { title: options.title || "Success", ...options });
  },

  warning: (message, options = {}) => {
    toast.warning(message, { title: options.title || "Warning", ...options });
  },

  error: (message, options = {}) => {
    toast.error(message, { title: options.title || "Error", ...options });
  },

  info: (message, options = {}) => {
    toast.info(message, { title: options.title || "Information", ...options });
  },
};
