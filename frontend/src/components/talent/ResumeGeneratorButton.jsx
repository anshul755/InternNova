import { Link } from "react-router-dom";
import { IoSparkles } from "react-icons/io5";

const T = {
  secondary: "var(--app-text-secondary)",
  accent: "var(--app-accent-end)",
};

/**
 * Talent-only navbar action: navigates to the dedicated /resume-generator route.
 */
export default function ResumeGeneratorButton({
  light = true,
  compact = false,
}) {
  const triggerClasses = compact
    ? `flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-xl transition-all duration-300 border border-transparent w-full ${
        light
          ? "hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25 text-slate-700 hover:text-slate-900"
          : "hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25 text-slate-300 hover:text-white"
      }`
    : `inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 border border-transparent ${
        light
          ? "text-slate-700 hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
          : "text-slate-300 hover:text-white hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
      }`;

  return (
    <Link
      to="/resume-generator"
      className={triggerClasses}
      style={compact ? { color: T.secondary } : undefined}
    >
      <IoSparkles className="w-4 h-4" style={{ color: T.accent }} />
      {compact ? "Generate Resume" : "Resume"}
    </Link>
  );
}
