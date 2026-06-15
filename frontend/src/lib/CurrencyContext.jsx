import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "internnova_currency";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "₹";
    } catch {
      return "₹";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // localStorage unavailable
    }
  }, [currency]);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === "₹" ? "$" : "₹"));
  }, []);

  const symbol = currency; // "₹" or "$"

  return (
    <CurrencyContext.Provider value={{ currency, symbol, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
