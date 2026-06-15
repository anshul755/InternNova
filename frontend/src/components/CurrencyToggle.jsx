import { useCurrency } from "../lib/CurrencyContext.jsx";

/**
 * CurrencyToggle — Compact pill button to switch between ₹ and $.
 *
 * Place inline next to salary/currency labels in forms.
 */
export default function CurrencyToggle({ className = "" }) {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      type="button"
      onClick={toggleCurrency}
      title={`Switch to ${currency === "₹" ? "USD ($)" : "INR (₹)"}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all
        bg-white/50 dark:bg-white/[0.06] border-[var(--app-border-strong)]
        text-[var(--app-text-secondary)] hover:bg-white/80 dark:hover:bg-white/[0.12]
        ${className}`}
    >
      <span className={currency === "₹" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
        ₹
      </span>
      <span className="text-slate-300 dark:text-slate-600">/</span>
      <span className={currency === "$" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
        $
      </span>
    </button>
  );
}
