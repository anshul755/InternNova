import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  IoBriefcaseOutline,
  IoBookmarkOutline,
  IoChevronDown,
  IoClose,
  IoDocumentTextOutline,
  IoGridOutline,
  IoLogOutOutline,
  IoMenu,
  IoPersonOutline,
} from "react-icons/io5";
import { useAuth } from "../lib/AuthContext.jsx";
import { useTheme } from "../lib/ThemeContext.jsx";
import { api } from "../lib/api.js";
import { resolveLogoUrl } from "../lib/media.js";
import ThemeToggle from "./ThemeToggle.jsx";
import ResumeGeneratorButton from "./talent/ResumeGeneratorButton.jsx";

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

function UserDropdown({ user, onLogout, light, displayName, avatarUrl }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCompany = user?.role?.toLowerCase() === "company";
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
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors ${
          light ? "hover:bg-white/60" : "hover:bg-white/[0.06]"
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        id="user-menu-button"
      >
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={displayName || "User avatar"}
            onError={() => setImgError(true)}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c7f284] to-[#8bcf7a] flex items-center justify-center text-xs font-semibold text-slate-900">
            {initial}
          </span>
        )}
        <span
          className={`hidden sm:block text-sm max-w-[180px] truncate ${
            light ? "text-slate-700" : "text-slate-300"
          }`}
        >
          {user?.email}
        </span>
        <IoChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            light ? "text-slate-400" : "text-slate-400"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`navbar-user-menu absolute right-0 top-full mt-2 w-56 glass-panel border border-white/60 py-2 overflow-hidden z-50 origin-top-right transition-all duration-200 ease-out will-change-transform ${
          open
            ? "pointer-events-auto visible opacity-100 translate-y-0 scale-100"
            : "pointer-events-none invisible opacity-0 -translate-y-2 scale-95"
        }`}
        role="menu"
        aria-labelledby="user-menu-button"
      >
        <div className="px-4 py-2.5 border-b border-white/40 bg-white/10">
          <div className="flex items-center gap-3">
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt={displayName || "User avatar"}
                onError={() => setImgError(true)}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#c7f284] to-[#8bcf7a] flex items-center justify-center text-sm font-semibold text-slate-900">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-slate-600 truncate">{displayName}</p>
              <p className="text-xs font-medium text-slate-900 mt-0.5">
                {isCompany ? "Company" : "Talent"}
              </p>
              <p className="text-[0.7rem] text-slate-500 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="py-1">
          {menuItems.map(({ label, icon, to }) => {
            const MenuIcon = icon;

            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-brand-100 transition-colors"
                role="menuitem"
              >
                <MenuIcon className="w-4 h-4 text-slate-500" />
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
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-brand-100 transition-colors"
            role="menuitem"
          >
            <IoLogOutOutline className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthenticatedNavbar() {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const useLight = resolvedTheme !== "dark";
  const isCompany = user?.role?.toLowerCase() === "company";
  const isTalent = !isCompany;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const loadDisplayName = async () => {
      if (!user?.id) {
        setDisplayName("");
        setAvatarUrl(null);
        return;
      }

      const fallbackName =
        user?.displayName ||
        user?.name ||
        user?.companyName ||
        user?.email ||
        "";

      try {
        const profilePath = isCompany
          ? `/company/v1/${user.id}`
          : `/talent/v1/${user.id}`;
        const res = await api.get(profilePath);
        const profile = await res.json();
        const nextName = isCompany ? profile?.companyName : profile?.name;
        const candidateAvatar = resolveLogoUrl(profile, profile?.data, user);

        if (!cancelled) {
          setDisplayName(nextName || fallbackName);
          setAvatarUrl(candidateAvatar || null);
        }
      } catch {
        if (!cancelled) {
          setDisplayName(fallbackName);
          setAvatarUrl(null);
        }
      }
    };

    loadDisplayName();

    return () => {
      cancelled = true;
    };
  }, [
    isCompany,
    user?.companyName,
    user?.displayName,
    user?.email,
    user?.id,
    user?.name,
  ]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const contextLabel = isCompany ? "Company Dashboard" : "Talent Dashboard";
  const navLinks = isCompany
    ? [
        { label: "My Jobs", to: "/company/jobs" },
        { label: "Post Job", to: "/jobs/create" },
        { label: "Applications", to: "/company/applications" },
      ]
    : [
        { label: "Jobs", to: "/jobs" },
        { label: "Applications", to: "/applications" },
        { label: "Saved", to: "/saved-jobs" },
      ];

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
        <div className="flex items-center gap-4">
          <Logo light={useLight} />
          <span
            className={`hidden sm:block w-px h-5 ${useLight ? "bg-slate-200" : "bg-white/10"}`}
            aria-hidden="true"
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
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-2 py-2 text-sm font-medium transition-colors border-b-2 ${
                  useLight
                    ? isActive
                      ? "text-slate-900 border-slate-900"
                      : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300"
                    : isActive
                      ? "text-white border-[#ecfccb] shadow-[0_1px_0_0_rgba(236,252,203,0.7)]"
                      : "text-slate-300 border-transparent hover:text-white hover:border-white/30"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isTalent && <ResumeGeneratorButton light={useLight} />}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserDropdown
            onLogout={handleLogout}
            user={user}
            light={useLight}
            displayName={
              displayName ||
              user?.displayName ||
              user?.name ||
              user?.companyName ||
              user?.email
            }
            avatarUrl={avatarUrl}
          />
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
              : "glass-dark border border-white/[0.06]"
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium transition-colors border-b-2 border-transparent ${
                    useLight
                      ? isActive
                        ? "text-slate-900 border-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      : isActive
                        ? "text-white border-[#ecfccb] shadow-[0_1px_0_0_rgba(236,252,203,0.1)]"
                        : "text-slate-300 hover:text-white hover:border-white/25"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {isTalent && (
              <div className="border-t border-white/40 mt-1 pt-1">
                <ResumeGeneratorButton compact />
              </div>
            )}

            <div
              className={`mt-3 pt-3 border-t ${useLight ? "border-white/40" : "border-white/[0.06]"}`}
            >
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium w-full transition-colors border-b border-transparent ${
                  useLight
                    ? "text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    : "text-slate-300 hover:text-white hover:border-white/25"
                }`}
              >
                <IoLogOutOutline className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
