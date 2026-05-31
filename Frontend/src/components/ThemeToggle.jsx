import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "../lib/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme, themePreference } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  const title =
    themePreference === "system" ? `${label} (following system)` : label;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`.trim()}
      aria-label={label}
      aria-pressed={isDark}
      title={title}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span
          className="theme-toggle__thumb"
          data-theme={isDark ? "dark" : "light"}
        />
        <IoSunnyOutline className="theme-toggle__icon theme-toggle__icon--sun" />
        <IoMoonOutline className="theme-toggle__icon theme-toggle__icon--moon" />
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
