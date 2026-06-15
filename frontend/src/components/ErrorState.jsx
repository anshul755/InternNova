import { FiAlertCircle } from "react-icons/fi";

const ErrorState = ({ title = "Unable to load data", message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl page-enter text-center w-full max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-rose-100 dark:border-rose-500/20">
        <FiAlertCircle size={24} strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        {message || "We're having trouble loading this content right now. Please try again in a few moments."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary px-5 py-2.5 text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
