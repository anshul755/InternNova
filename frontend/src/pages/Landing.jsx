import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import companies from "../data/companies";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { resolveLogoUrl } from "../lib/media.js";
import { useTheme } from "../lib/ThemeContext.jsx";
import CardSwap, { Card } from "../components/CardSwap.jsx";
import MobileCarousel from "../components/MobileCarousel.jsx";
import {
  IoDocumentTextOutline,
  IoBriefcaseOutline,
  IoStatsChartOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

const midpoint = Math.ceil(companies.length / 2);
const companiesRowOne = companies.slice(0, midpoint);
const companiesRowTwo = companies.slice(midpoint);
const logoCircleClassName =
  "logo-circle group relative flex items-center justify-center w-32 h-32 rounded-full";

const Landing = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const heroImages = isDark
    ? ["/swap-card/D1.png", "/swap-card/D2.png", "/swap-card/D3.png", "/swap-card/D4.png"]
    : ["/swap-card/L1.png", "/swap-card/L2.png", "/swap-card/L3.png", "/swap-card/L4.png"];

  return (
    <div className="relative min-h-screen text-slate-900 px-[5vw] py-6 flex flex-col font-sans overflow-x-hidden saas-section page-enter">
      <Seo title="InternNova | Home" description="AI-powered internship matching platform. Find your dream internship or discover top early talent, faster." path="/" />
      <Navbar hideGuestCenterNav />
      <main className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.1fr] gap-12 items-center pt-24">
        <section
          className="flex justify-center order-first lg:order-last w-full animate-fade-in"
          aria-hidden="true"
        >
          {/* Desktop & Tablet Mockup Section (CardSwap) */}
          <div className="hidden md:block relative w-full aspect-[4/3] lg:aspect-[20/15] bg-transparent overflow-visible">
            <div className="absolute inset-0 w-[100%] h-full flex items-center justify-center pt-16 pr-16">
              <CardSwap delay={3500} width="100%" height="auto">
                {heroImages.map((src, idx) => (
                  <Card key={`${isDark ? "d" : "l"}-${idx}`}>
                    <img
                      src={src}
                      alt={`Feature ${idx + 1}`}
                      className="w-[100%] md:w-[120%] max-w-none h-auto rounded-xl shadow-2xl border border-white/10 object-cover"
                    />
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>

          {/* Mobile Mockup Section (Carousel) */}
          <div className="block md:hidden w-full max-w-md px-2">
            <MobileCarousel isDark={isDark} />
          </div>
        </section>
        <section>
          <p className="uppercase tracking-[0.16em] text-[0.75rem] text-slate-500">
            AI-powered internship platform
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] my-4 text-slate-900">
            Match, tailor, and ship a stronger resume.
          </h1>
          <p className="max-w-lg text-slate-600 text-base">
            InternNova helps students and early-career talent compare a resume
            with a job post, generate an ATS-friendly version, and keep the
            final output grounded in the real profile.
          </p>

          <div className="flex flex-wrap gap-3 my-7">
            <button
              className="btn-primary text-sm"
              onClick={() => navigate("/register")}
            >
              Try it free
            </button>
            <button
              className="btn-secondary text-sm"
              onClick={() =>
                navigate("/login", {
                  state: {
                    customMessage:
                      "Sign in to access your personalized dashboard, track applications, and manage your profile.",
                  },
                })
              }
            >
              See your dashboard
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-[0.85rem] text-slate-600">
            {[
              "AI resume-to-job matching",
              "ATS-friendly resume generation",
              "Talent and company dashboards",
            ].map((text) => (
              <span key={text} className="glass-pill px-4 py-1.5">
                {"\u2713"} {text}
              </span>
            ))}
          </div>
        </section>
      </main>
      <section className="mt-16 -mx-[5vw]">
        <div className="relative w-full overflow-hidden py-16 pb-20 space-y-10">
          <div className="flex animate-scroll-left w-max">
            {companiesRowOne.map((company, idx) => (
              <div
                key={`row1-first-${idx}`}
                className="floating-bubble flex-shrink-0 mx-4"
                style={{
                  animationDelay: `${idx * 0.4}s`,
                  animationDuration: `${8 + (idx % 5)}s`,
                }}
              >
                <a
                  href={company.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={logoCircleClassName}
                  title={company.name}
                >
                  <div className="logo-circle__media w-20 h-20 flex items-center justify-center p-2">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="logo-circle__img max-w-full max-h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = document.createElement("span");
                        fallback.className = "logo-circle__fallback";
                        fallback.textContent = company.name
                          .substring(0, 2)
                          .toUpperCase();
                        e.target.parentElement.appendChild(fallback);
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {company.name}
                  </span>
                </a>
              </div>
            ))}
            {companiesRowOne.map((company, idx) => (
              <div
                key={`row1-second-${idx}`}
                className="floating-bubble flex-shrink-0 mx-4"
                style={{
                  animationDelay: `${(idx + companiesRowOne.length) * 0.4}s`,
                  animationDuration: `${8 + ((idx + companiesRowOne.length) % 5)}s`,
                }}
              >
                <a
                  href={company.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={logoCircleClassName}
                  title={company.name}
                >
                  <div className="logo-circle__media w-20 h-20 flex items-center justify-center p-2">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="logo-circle__img max-w-full max-h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = document.createElement("span");
                        fallback.className = "logo-circle__fallback";
                        fallback.textContent = company.name
                          .substring(0, 2)
                          .toUpperCase();
                        e.target.parentElement.appendChild(fallback);
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {company.name}
                  </span>
                </a>
              </div>
            ))}
          </div>
          {companiesRowTwo.length > 0 && (
            <div className="flex animate-scroll-right w-max">
              {companiesRowTwo.map((company, idx) => (
                <div
                  key={`row2-first-${idx}`}
                  className="floating-bubble flex-shrink-0 mx-4"
                  style={{
                    animationDelay: `${idx * 0.4}s`,
                    animationDuration: `${8 + (idx % 5)}s`,
                  }}
                >
                  <a
                    href={company.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={logoCircleClassName}
                    title={company.name}
                  >
                    <div className="logo-circle__media w-20 h-20 flex items-center justify-center p-2">
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="logo-circle__img max-w-full max-h-full object-contain"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = document.createElement("span");
                          fallback.className = "logo-circle__fallback";
                          fallback.textContent = company.name
                            .substring(0, 2)
                            .toUpperCase();
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    </div>
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {company.name}
                    </span>
                  </a>
                </div>
              ))}
              {companiesRowTwo.map((company, idx) => (
                <div
                  key={`row2-second-${idx}`}
                  className="floating-bubble flex-shrink-0 mx-4"
                  style={{
                    animationDelay: `${(idx + companiesRowTwo.length) * 0.4}s`,
                    animationDuration: `${8 + ((idx + companiesRowTwo.length) % 5)}s`,
                  }}
                >
                  <a
                    href={company.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={logoCircleClassName}
                    title={company.name}
                  >
                    <div className="logo-circle__media w-20 h-20 flex items-center justify-center p-2">
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="logo-circle__img max-w-full max-h-full object-contain"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = document.createElement("span");
                          fallback.className = "logo-circle__fallback";
                          fallback.textContent = company.name
                            .substring(0, 2)
                            .toUpperCase();
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    </div>
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {company.name}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="-mx-[5vw] -mb-6">
        <Footer />
      </div>
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes float-bubble {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(6px, -8px, 0) rotate(1.5deg);
          }
          50% {
            transform: translate3d(0, -16px, 0) rotate(0deg);
          }
          75% {
            transform: translate3d(-6px, -8px, 0) rotate(-1.5deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 65s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        .animate-scroll-right {
          animation: scroll-right 65s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        /* Pause horizontal scrolling when hovering over a row */
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }

        .floating-bubble {
          animation-name: float-bubble;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        /* Pause floating animation when hovering over the card logo itself */
        .floating-bubble:has(.logo-circle:hover) {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-left,
          .animate-scroll-right,
          .floating-bubble {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
