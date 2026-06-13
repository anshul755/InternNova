import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const wrapperClass = "saas-footer mt-auto";

  const isCompany = user?.role === "Company";
  const isTalent = user?.role === "Talent";
  const platformLink = isCompany
    ? { to: "/company/jobs", label: "My Jobs" }
    : { to: "/jobs", label: "Browse Jobs" };

  const talentLinks = [
    { to: "/dashboard/talent", label: "Talent Dashboard" },
    { to: "/jobs", label: "Jobs" },
    { to: "/applications", label: "Applications" },
    { to: "/saved-jobs", label: "Saved Jobs" },
    { to: "/profile/edit", label: "Resume Profile" },
  ];

  const companyLinks = [
    { to: "/dashboard/company", label: "Company Dashboard" },
    { to: "/company/jobs", label: "My Jobs" },
    { to: "/jobs/create", label: "Post Job" },
    { to: "/company/applications", label: "Applications" },
    { to: "/company/profile/edit", label: "Company Profile" },
  ];

  const headingClass =
    "text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3";

  const linkClass =
    "text-sm text-slate-600 hover:text-slate-900 transition-colors";

  const mutedClass = "text-xs text-slate-600";

  const descClass = "text-xs text-slate-600 max-w-xs leading-relaxed";

  const brandClass = "font-semibold text-slate-900 text-sm tracking-wide";

  const dividerClass = "border-t border-white/40 mt-8 pt-6";

  return (
    <footer className={wrapperClass} role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c7f284] to-[#8fd9b6] flex items-center justify-center font-bold text-[0.6rem] text-slate-900">
                IN
              </div>
              <span className={brandClass}>InternNova</span>
            </div>
            <p className={descClass}>
              AI-powered internship matching platform. Find your dream
              internship or discover top early talent, faster.
            </p>
          </div>

          <div>
            <h4 className={headingClass}>Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to={platformLink.to} className={linkClass}>
                  {platformLink.label}
                </Link>
              </li>
              {!user && (
                <>
                  <li>
                    <Link to="/login" className={linkClass}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register/talent" className={linkClass}>
                      Sign Up as Talent
                    </Link>
                  </li>
                  <li>
                    <Link to="/register/company" className={linkClass}>
                      Register Company
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {(!user || isTalent) && (
            <div>
              <h4 className={headingClass}>Talent</h4>
              <ul className="space-y-2">
                {talentLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(!user || isCompany) && (
            <div>
              <h4 className={headingClass}>Company</h4>
              <ul className="space-y-2">
                {companyLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className={headingClass}>Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className={linkClass}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`${dividerClass} flex flex-col sm:flex-row items-center justify-between gap-3`}
        >
          <p className={mutedClass}>
            &copy; {currentYear} InternNova. All rights reserved.
          </p>
          <p className={mutedClass}>
            Built with care for the next generation of talent.
          </p>
        </div>
      </div>
    </footer>
  );
}
