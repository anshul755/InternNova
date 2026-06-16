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
      className="flex items-center gap-1.5 group"
      aria-label="InternNova Home"
    >
      <img
        src={light ? "/internNova-light.png" : "/internNova-dark.png"}
        alt="InternNova Logo"
        className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
      />
      <span
        className={`font-semibold tracking-wide text-[1.05rem] mt-1 ${light ? "text-slate-900" : "text-slate-100"}`}
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
        label: "Company Profile",
        icon: IoPersonOutline,
        to: "/company/profile",
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
      { label: "My Profile", icon: IoPersonOutline, to: "/profile" },
    ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-all duration-300 border border-transparent ${
          light 
            ? "hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25" 
            : "hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
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
          className={`hidden sm:block text-sm max-w-[180px] truncate ${light ? "text-slate-700" : "text-slate-300"
            }`}
        >
          {displayName || user?.displayName || user?.name || user?.companyName || "User"}
        </span>
        <IoChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${light ? "text-slate-400" : "text-slate-400"
            } ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`navbar-user-menu absolute right-0 top-full mt-2 w-56 glass-panel border border-white/60 py-2 overflow-hidden z-50 origin-top-right transition-all duration-200 ease-out will-change-transform ${open
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
                className={`flex items-center gap-3 px-3 py-2.5 mx-1 my-0.5 rounded-lg text-sm transition-all duration-300 ${light
                    ? "text-slate-700 hover:text-slate-900 hover:bg-[#f4f8f2] hover:shadow-[0_0_14px_rgba(124,200,74,0.4)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:shadow-[0_0_16px_rgba(159,232,112,0.25)]"
                  }`}
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
            className={`flex w-[calc(100%-0.5rem)] items-center gap-3 px-3 py-2.5 mx-1 my-0.5 rounded-lg text-sm transition-all duration-300 ${light
                ? "text-slate-700 hover:text-slate-900 hover:bg-[#f4f8f2] hover:shadow-[0_0_14px_rgba(124,200,74,0.4)]"
                : "text-slate-300 hover:text-white hover:bg-white/5 hover:shadow-[0_0_16px_rgba(159,232,112,0.25)]"
              }`}
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

// In-memory cache for user profile data (display name & avatar url) to prevent flickering when unmounting/remounting
export const profileCache = new Map();

export default function AuthenticatedNavbar() {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cached = user?.id ? profileCache.get(user.id) : null;
  const [displayName, setDisplayName] = useState(
    () => cached?.displayName || user?.displayName || user?.name || user?.companyName || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(() => cached?.avatarUrl || null);

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
          const nameToSet = nextName || fallbackName;
          const avatarToSet = candidateAvatar || null;
          setDisplayName(nameToSet);
          setAvatarUrl(avatarToSet);

          // Cache the resolved values
          profileCache.set(user.id, {
            displayName: nameToSet,
            avatarUrl: avatarToSet,
          });
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
    user?.id,
    user?.name,
  ]);

  const handleLogout = async () => {
    if (user?.id) {
      profileCache.delete(user.id);
    }
    await logout();
    navigate("/", { replace: true });
  };

  const contextLabel = isCompany ? "Company Dashboard" : "Talent Dashboard";
  const navLinks = isCompany
    ? [
      { label: "Dashboard", to: "/dashboard/company" },
      { label: "My Jobs", to: "/company/jobs" },
      { label: "Post Job", to: "/jobs/create" },
      { label: "Applications", to: "/company/applications" },
    ]
    : [
      { label: "Dashboard", to: "/dashboard/talent" },
      { label: "Jobs", to: "/jobs" },
      { label: "Applications", to: "/applications" },
      { label: "Saved", to: "/saved-jobs" },
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
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4">
          <Logo light={useLight} />
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full border ${useLight
                  ? isActive
                    ? "text-slate-900 bg-[#7cc84a]/12 border-[#7cc84a]/25 shadow-[0_2px_8px_rgba(124,200,74,0.08)]"
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
                  : isActive
                    ? "text-white bg-[#9fe870]/12 border-[#9fe870]/25 shadow-[0_0_14px_rgba(159,232,112,0.18)]"
                    : "text-slate-300 border-transparent hover:text-white hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
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
              "User"
            }
            avatarUrl={avatarUrl}
          />
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
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl border ${useLight
                    ? isActive
                      ? "text-slate-900 bg-[#7cc84a]/12 border-[#7cc84a]/20 shadow-sm"
                      : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
                    : isActive
                      ? "text-white bg-[#9fe870]/12 border-[#9fe870]/20 shadow-[0_0_12px_rgba(159,232,112,0.1)]"
                      : "text-slate-300 border-transparent hover:text-white hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {isTalent && (
              <div className={`mt-1.5 pt-1.5 border-t ${useLight ? "border-slate-200" : "border-white/[0.06]"}`}>
                <ResumeGeneratorButton compact light={useLight} />
              </div>
            )}

            <div
              className={`mt-1.5 pt-1.5 border-t ${useLight ? "border-slate-200" : "border-white/[0.06]"}`}
            >
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium w-full transition-all duration-300 rounded-xl border border-transparent ${useLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
                    : "text-slate-300 hover:text-white hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
                  }`}
              >
                <IoLogOutOutline className="w-4.5 h-4.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
