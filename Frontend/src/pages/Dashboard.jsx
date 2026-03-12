import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

const ROLE_COLORS = {
  Talent: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/40" },
  Company: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40" },
  Admin: { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/40" },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "Talent";
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.Talent;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#0a1628_100%)] text-white font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-200">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dashboard</p>
                <p className="text-sm font-medium text-slate-100 truncate max-w-[200px]">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Auth success banner */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 mb-6 flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 text-xs">
              ✓
            </span>
            <p className="text-sm text-emerald-300">
              Authentication successful — you&apos;re securely logged in.
            </p>
          </div>

          {/* User details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/60 px-4 py-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide">Email</span>
              <span className="text-sm text-slate-100">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/60 px-4 py-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide">Role</span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {role}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/60 px-4 py-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide">User ID</span>
              <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                {user?.id}
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[0.7rem] text-slate-500">
            InternNova &mdash; More features coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
