const STATUS_COLORS = {
  // Neutral
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  ARCHIVED: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  WITHDRAWN: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  
  // Success
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  HIRED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  OFFER: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",

  // Warning
  CLOSED: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",

  // Info
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",

  // Progress
  UNDER_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",

  // Action
  SHORTLISTED: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  INTERVIEW: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",

  // Negative
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

const StatusBadge = ({ status, className = "" }) => {
  if (!status) return null;
  
  const formattedStatus = String(status).toUpperCase();
  const colorClasses = STATUS_COLORS[formattedStatus] || STATUS_COLORS.DRAFT;
  const displayLabel = formattedStatus.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border tracking-wide uppercase ${colorClasses} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
