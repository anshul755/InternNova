import React from "react";
import { useNavigate } from "react-router-dom";
import companies from "../data/companies";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { resolveLogoUrl } from "../lib/media.js";
import CardSwap, { Card } from "../components/CardSwap.jsx";
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
  "logo-circle group relative flex items-center justify-center w-32 h-32 flex-shrink-0 mx-4 rounded-full floating-bubble";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-slate-900 px-[5vw] py-6 flex flex-col font-sans overflow-x-hidden saas-section">
      <Navbar hideGuestCenterNav />
      <main className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.1fr] gap-12 items-center pt-24">
        <section
          className="flex justify-center order-first lg:order-last w-full"
          aria-hidden="true"
        >
          {/* Fixed rectangle screen */}
          <div className="relative w-full aspect-[4/3] lg:aspect-[20/15] bg-transparent overflow-visible">
            
            {/* Inner container centered */}
            <div className="absolute inset-0 w-[100%] h-full flex items-center justify-center pt-16 pr-16">
              <CardSwap delay={3500} width="100%" height="auto">
                <Card>
                  <img 
                    src="/swap-card/img1.png" 
                    alt="Feature 1" 
                    className="w-[100%] md:w-[120%] max-w-none h-auto rounded-xl shadow-2xl border border-white/10 object-cover"
                  />
                </Card>
                <Card>
                  <img 
                    src="/swap-card/img2.png" 
                    alt="Feature 2" 
                    className="w-[100%] md:w-[120%] max-w-none h-auto rounded-xl shadow-2xl border border-white/10 object-cover"
                  />
                </Card>
                <Card>
                  <img 
                    src="/swap-card/img3.png" 
                    alt="Feature 3" 
                    className="w-[100%] md:w-[120%] max-w-none h-auto rounded-xl shadow-2xl border border-white/10 object-cover"
                  />
                </Card>
                <Card>
                  <img 
                    src="/swap-card/img4.png" 
                    alt="Feature 4" 
                    className="w-[100%] md:w-[120%] max-w-none h-auto rounded-xl shadow-2xl border border-white/10 object-cover"
                  />
                </Card>
              </CardSwap>
            </div>
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
              <a
                key={`row1-first-${idx}`}
                href={company.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={logoCircleClassName}
                style={{
                  animationDelay: `${idx * 0.4}s`,
                  animationDuration: `${8 + (idx % 5)}s`,
                }}
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
            ))}
            {companiesRowOne.map((company, idx) => (
              <a
                key={`row1-second-${idx}`}
                href={company.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={logoCircleClassName}
                style={{
                  animationDelay: `${(idx + companiesRowOne.length) * 0.4}s`,
                  animationDuration: `${
                    8 + ((idx + companiesRowOne.length) % 5)
                  }s`,
                }}
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
            ))}
          </div>
          {companiesRowTwo.length > 0 && (
            <div className="flex animate-scroll-right w-max">
              {companiesRowTwo.map((company, idx) => (
                <a
                  key={`row2-first-${idx}`}
                  href={company.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={logoCircleClassName}
                  style={{
                    animationDelay: `${idx * 0.4}s`,
                    animationDuration: `${8 + (idx % 5)}s`,
                  }}
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
              ))}
              {companiesRowTwo.map((company, idx) => (
                <a
                  key={`row2-second-${idx}`}
                  href={company.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={logoCircleClassName}
                  style={{
                    animationDelay: `${(idx + companiesRowTwo.length) * 0.4}s`,
                    animationDuration: `${
                      8 + ((idx + companiesRowTwo.length) % 5)
                    }s`,
                  }}
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
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes float-bubble {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(8px, -10px, 0) rotate(2deg);
          }
          50% {
            transform: translate3d(0, -20px, 0) rotate(0deg);
          }
          75% {
            transform: translate3d(-8px, -10px, 0) rotate(-2deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 55s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        .animate-scroll-right {
          animation: scroll-right 55s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        .floating-bubble {
          animation-name: float-bubble;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
          transform: translateZ(0);
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
