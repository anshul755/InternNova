import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoClose, IoMenu } from "react-icons/io5";
import { useAuth } from "../lib/AuthContext.jsx";
import { useTheme } from "../lib/ThemeContext.jsx";
import AuthenticatedNavbar from "./AuthenticatedNavbar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function Logo({ light }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-0.1 group"
      aria-label="InternNova Home"
    >
      <img
        src={light ? "/internNova-light.png" : "/internNova-dark.png"}
        alt="InternNova Logo"
        className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
      />
      <span
        className={`font-semibold tracking-wide text-[1.05rem] ${light ? "text-slate-900" : "text-slate-100"}`}
      >
        InternNova
      </span>
    </Link>
  );
}

export default function Navbar({ hideGuestCenterNav = false }) {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !loading && !!user;
  const useLight = resolvedTheme !== "dark";

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

  const landingLinks = hideGuestCenterNav
    ? []
    : [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
      ];

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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4">
          <Logo light={useLight} />
        </div>

        <div className="hidden md:flex items-center gap-1">
          {landingLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={`px-2 py-2 text-sm font-medium transition-colors border-b-2 border-transparent ${
                useLight
                  ? "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  : "text-slate-300 hover:text-white hover:border-white/30"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            to="/login"
            className={`hidden sm:inline-flex items-center px-2 py-2 text-sm font-medium border-b-2 border-transparent transition-colors ${
              useLight
                ? "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                : "text-slate-300 hover:text-white hover:border-white/30"
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`hidden sm:inline-flex items-center px-2 py-2 text-sm font-semibold border-b-2 transition-colors ${
              useLight
                ? "text-slate-900 border-slate-400 hover:border-slate-900"
                : "text-white border-white/50 hover:border-white"
            }`}
          >
            Get Started
          </Link>

          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              useLight
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
          className={`md:hidden mx-4 mb-4 rounded-xl p-4 animate-slide-down ${
            useLight
              ? "bg-white/50 border border-white/50 shadow-glass backdrop-blur-lg"
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
                className={`px-4 py-3 text-sm font-medium transition-colors border-b border-transparent ${
                  useLight
                    ? "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    : "text-slate-300 hover:text-white hover:border-white/25"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}

            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/[0.06]">
              <Link
                to="/login"
                className={`px-4 py-3 text-sm font-medium transition-colors border-b border-transparent ${
                  useLight
                    ? "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    : "text-slate-300 hover:text-white hover:border-white/25"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-4 py-3 text-sm font-semibold transition-colors border-b border-transparent ${
                  useLight
                    ? "text-slate-900 hover:border-slate-900"
                    : "text-white hover:border-white"
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
