import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoClose, IoMenu } from "react-icons/io5";
import { useAuth } from "../lib/AuthContext.jsx";
import { useTheme } from "../lib/ThemeContext.jsx";
import AuthenticatedNavbar from "./AuthenticatedNavbar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function Logo({ light }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-1.5 group"
      aria-label="InternNova Home"
    >
      <img
        src={light ? "/internNova-light.png" : "/internNova-dark.png"}
        alt="InternNova Logo"
        className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
      />
      <span
        className={`font-semibold tracking-wide text-xl mt-1 ${light ? "text-slate-900" : "text-slate-100"}`}
      >
        InternNova
      </span>
    </Link>
  );
}

export default function Navbar({ hideGuestCenterNav = false }) {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !loading && !!user;
  const useLight = resolvedTheme !== "dark";
  const isLoginActive = location.pathname === "/login";
  const isRegisterActive = location.pathname === "/register";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [isAuthenticated, hideGuestCenterNav]);

  if (isAuthenticated) {
    return <AuthenticatedNavbar />;
  }

  const landingLinks = [];

  const headerBg = scrolled
    ? "saas-nav saas-nav--solid"
    : useLight
      ? "saas-nav"
      : "bg-transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      role="banner"
    >
      <nav
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4">
          <Logo light={useLight} />
        </div>

        <div className="hidden md:flex items-center gap-1" />

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            to="/login"
            className={`hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 border ${
              isLoginActive
                ? "btn-primary border-transparent !px-5 !py-2"
                : `border-transparent bg-transparent ${
                    useLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
                      : "text-slate-300 hover:text-white hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
                  }`
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
              isRegisterActive
                ? "btn-primary border border-transparent !px-5 !py-2"
                : `btn-secondary !px-5 !py-2 ${
                    useLight
                      ? "hover:bg-[#7cc84a]/10 hover:border-[#7cc84a]/40"
                      : "hover:bg-[#9fe870]/10 hover:border-[#9fe870]/40"
                  }`
            }`}
          >
            Get Started
          </Link>

          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${useLight
              ? "hover:bg-white/60 text-slate-700"
              : "hover:bg-white/[0.06] text-slate-300"
              }`}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <IoClose className="w-5 h-5" />
            ) : (
              <IoMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className={`md:hidden absolute top-full left-4 right-4 mt-2 rounded-xl p-4 shadow-xl animate-slide-down ${useLight
            ? "bg-white/90 border border-slate-200 shadow-glass backdrop-blur-lg"
            : "glass-panel border-white/[0.06]"
            }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {landingLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b border-transparent ${useLight
                  ? "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  : "text-slate-300 hover:text-white hover:border-white/25"
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}

            <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
              <Link
                to="/login"
                className={`w-full justify-center py-2.5 text-sm font-semibold text-center rounded-full transition-all duration-300 border ${
                  isLoginActive
                    ? "btn-primary border-transparent !py-2.5"
                    : `border-transparent bg-transparent ${
                        useLight
                          ? "text-slate-600 hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
                          : "text-slate-300 hover:text-slate-200 hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
                      }`
                }`}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`w-full justify-center py-2.5 text-sm font-semibold text-center transition-all duration-300 ${
                  isRegisterActive
                    ? "btn-primary border border-transparent !py-2.5"
                    : `btn-secondary !py-2.5 ${
                        useLight
                          ? "hover:bg-[#7cc84a]/10 hover:border-[#7cc84a]/40"
                          : "hover:bg-[#9fe870]/10 hover:border-[#9fe870]/40"
                      }`
                }`}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
