import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { useTheme } from "../lib/ThemeContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import {
  IoMenu,
  IoClose,
  IoChevronDown,
  IoLogOutOutline,
  IoPersonOutline,
  IoBriefcaseOutline,
  IoBookmarkOutline,
  IoDocumentTextOutline,
  IoGridOutline,
} from "react-icons/io5";

/* ─── Logo ─── */
function Logo({ light }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 group"
      aria-label="InternNova Home"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c7f284] to-[#8fd9b6] flex items-center justify-center font-bold text-xs text-slate-900 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
        IN
      </div>
      <span
        className={`font-semibold tracking-wide text-[0.95rem] ${light ? "text-slate-900" : "text-slate-100"}`}
      >
        InternNova
      </span>
    </Link>
  );
}

/* ─── User Dropdown ─── */
function UserDropdown({ user, onLogout, light }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCompany = user?.role === "Company";
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  const menuItems = isCompany
    ? [
        { label: "Dashboard", icon: IoGridOutline, to: "/dashboard/company" },
        { label: "Post Job", icon: IoBriefcaseOutline, to: "/jobs/create" },
        {
          label: "Applications",
          icon: IoDocumentTextOutline,
          to: "/company/applications",
        },
        {
          label: "Edit Profile",
          icon: IoPersonOutline,
          to: "/company/profile/edit",
        },
      ]
    : [
        { label: "Dashboard", icon: IoGridOutline, to: "/dashboard/talent" },
        { label: "Browse Jobs", icon: IoBriefcaseOutline, to: "/jobs" },
        {
          label: "My Applications",
          icon: IoDocumentTextOutline,
          to: "/applications",
        },
        { label: "Saved Jobs", icon: IoBookmarkOutline, to: "/saved-jobs" },
        { label: "Edit Profile", icon: IoPersonOutline, to: "/profile/edit" },
      ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors ${
          light ? "hover:bg-white/60" : "hover:bg-white/[0.06]"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
        id="user-menu-button"
      >
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c7f284] to-[#8bcf7a] flex items-center justify-center text-xs font-semibold text-slate-900">
          {initial}
        </span>
        <span
          className={`hidden sm:block text-sm max-w-[140px] truncate ${light ? "text-slate-700" : "text-slate-300"}`}
        >
          {user?.email}
        </span>
        <IoChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            light ? "text-slate-400" : "text-slate-400"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 glass-card border border-white/60 py-2 animate-slide-down z-50"
          role="menu"
          aria-labelledby="user-menu-button"
        >
          <div className="px-4 py-2.5 border-b border-white/40">
            <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            <p className="text-xs font-medium text-slate-900 mt-0.5">
              {isCompany ? "Company" : "Talent"}
            </p>
          </div>

          <div className="py-1">
            {menuItems.map(({ label, icon, to }) => {
              const MenuIcon = icon;

              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-colors"
                  role="menuitem"
                >
                  <MenuIcon className="w-4 h-4 text-slate-400" />
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-white/40 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-colors"
              role="menuitem"
            >
              <IoLogOutOutline className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ─── */
export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !loading && !!user;
  const useLight = theme !== "dark";

  /* scroll listener */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* close mobile menu on route change */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const contextLabel =
    user?.role === "Company" ? "Company Dashboard" : "Talent Dashboard";

  const landingLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  const talentLinks = [
    { label: "Jobs", to: "/jobs" },
    { label: "Applications", to: "/applications" },
    { label: "Saved", to: "/saved-jobs" },
  ];

  const companyLinks = [
    { label: "Jobs", to: "/jobs" },
    { label: "Post Job", to: "/jobs/create" },
    { label: "Applications", to: "/company/applications" },
  ];

  const navLinks = isAuthenticated
    ? user?.role === "Company"
      ? companyLinks
      : talentLinks
    : [];

  // Header background styles
  const headerBg = useLight
    ? scrolled
      ? "saas-nav saas-nav--solid"
      : "saas-nav"
    : scrolled
      ? "glass-dark shadow-lg shadow-black/20"
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
        {/* Left — Logo + Context */}
        <div className="flex items-center gap-4">
          <Logo light={useLight} />
          {isAuthenticated && (
            <>
              <span
                className={`hidden sm:block w-px h-5 ${useLight ? "bg-slate-200" : "bg-white/10"}`}
              />
              <Link
                to="/dashboard"
                className={`hidden sm:block text-sm font-medium transition-colors ${
                  useLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {contextLabel}
              </Link>
            </>
          )}
        </div>

        {/* Center — Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {!isAuthenticated
            ? landingLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="px-3.5 py-2 text-sm text-slate-700 hover:text-slate-900 rounded-full hover:bg-white/70 transition-colors"
                >
                  {label}
                </a>
              ))
            : navLinks.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm rounded-lg transition-colors ${
                      useLight
                        ? isActive
                          ? "text-slate-900 bg-white/60 font-medium"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        : isActive
                          ? "text-white bg-white/[0.08] font-medium"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
        </div>

        {/* Right — Auth actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm text-slate-700 hover:text-slate-900 rounded-lg hover:bg-white/60 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 transition-all btn-primary"
              >
                Sign In
              </Link>
            </>
          ) : (
            <UserDropdown
              onLogout={handleLogout}
              user={user}
              light={useLight}
            />
          )}

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              useLight
                ? "hover:bg-white/60 text-slate-700"
                : "hover:bg-white/[0.06] text-slate-300"
            }`}
            onClick={() => setMobileOpen((v) => !v)}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`md:hidden mx-4 mb-4 rounded-xl p-4 animate-slide-down ${
            useLight
              ? "bg-white/50 border border-white/50 shadow-glass backdrop-blur-lg"
              : "glass-dark border border-white/[0.06]"
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {!isAuthenticated
              ? landingLinks.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="px-4 py-3 text-sm text-slate-700 hover:text-slate-900 rounded-lg hover:bg-white/60 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                ))
              : navLinks.map(({ label, to }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 text-sm rounded-lg transition-colors ${
                        useLight
                          ? isActive
                            ? "text-slate-900 bg-white/60 font-medium"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                          : isActive
                            ? "text-white bg-white/[0.08] font-medium"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}

            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                <Link
                  to="/login"
                  className="btn-secondary !w-full !justify-center !text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="btn-primary !w-full !justify-center !text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div
                className={`mt-3 pt-3 border-t ${useLight ? "border-white/40" : "border-white/[0.06]"}`}
              >
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-colors w-full"
                >
                  <IoLogOutOutline className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
