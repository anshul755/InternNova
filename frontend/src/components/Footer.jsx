import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { useTheme } from "../lib/ThemeContext.jsx";
import { IoLogoGithub, IoMail } from "react-icons/io5";

export default function Footer() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  const useLight = resolvedTheme !== "dark";
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
    { to: "/profile", label: "My Profile" },
  ];

  const companyLinks = [
    { to: "/dashboard/company", label: "Company Dashboard" },
    { to: "/company/jobs", label: "My Jobs" },
    { to: "/jobs/create", label: "Post Job" },
    { to: "/company/applications", label: "Applications" },
    { to: "/company/profile", label: "Company Profile" },
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-16">
          <div className="max-w-md flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-1.5 group self-start" aria-label="InternNova Home">
              <img
                src={useLight ? "/internNova-light.png" : "/internNova-dark.png"}
                alt="InternNova Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className={`font-semibold tracking-wide text-sm mt-1 ${useLight ? "text-slate-900" : "text-slate-100"}`}>
                InternNova
              </span>
            </Link>
            <p className={descClass}>
              AI-powered internship matching platform. Find your dream
              internship or discover top early talent, faster.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://github.com/anshul755/InternNova"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:scale-110"
                aria-label="GitHub Repository"
              >
                <IoLogoGithub size={20} />
              </a>
              <a
                href="mailto:internnova7@gmail.com"
                className="text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:scale-110"
                aria-label="Email Support"
              >
                <IoMail size={20} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:flex lg:flex-row lg:justify-between lg:gap-12 xl:gap-16">
            {/* Column 1: Platform & Legal */}
            <div className="flex flex-col gap-10 lg:contents">
              <div className="flex flex-col lg:order-1">
                <h4 className={headingClass}>Platform</h4>
                <ul className="space-y-3">
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

              <div className="flex flex-col lg:order-4">
                <h4 className={headingClass}>Legal</h4>
                <ul className="space-y-3">
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

            {/* Column 2: Talent & Company */}
            <div className="flex flex-col gap-10 lg:contents">
              {(!user || isTalent) && (
                <div className="flex flex-col lg:order-2">
                  <h4 className={headingClass}>Talent</h4>
                  <ul className="space-y-3">
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
                <div className="flex flex-col lg:order-3">
                  <h4 className={headingClass}>Company</h4>
                  <ul className="space-y-3">
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
            </div>
          </div>
        </div>

        <div className={`${dividerClass} flex flex-col gap-6 text-center md:flex-row md:justify-between md:text-left md:items-center`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center md:justify-start sm:gap-4">
            <p className={mutedClass}>
              &copy; {currentYear} InternNova. All rights reserved.
            </p>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600 text-xs">•</span>
            <p className={mutedClass}>
              Built with care for the next generation of talent.
            </p>
          </div>
          <p className={`${mutedClass} max-w-md mx-auto md:mx-0 text-slate-500 opacity-80 leading-relaxed text-xs`}>
            Disclaimer: This is a prototype; all profiles and job listings are illustrative only.
          </p>
        </div>
      </div>
    </footer>
  );
}
