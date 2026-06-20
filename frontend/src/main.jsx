import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import { AlertProvider } from "./lib/AlertContext.jsx";
import { CurrencyProvider } from "./lib/CurrencyContext.jsx";
import { ThemeProvider } from "./lib/ThemeContext.jsx";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Prevent number inputs from changing value on scroll
document.addEventListener("wheel", (e) => {
  if (document.activeElement?.type === "number") {
    document.activeElement.blur();
  }
}, { passive: true });

// Prevent non-numeric characters (e, E, +, -) in number inputs
document.addEventListener("keydown", (e) => {
  if (
    document.activeElement?.type === "number" &&
    ["e", "E", "+", "-"].includes(e.key)
  ) {
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <AlertProvider>
              <App />
              <SpeedInsights />
              <Analytics />
            </AlertProvider>
          </AuthProvider>
        </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  </StrictMode>,
);
