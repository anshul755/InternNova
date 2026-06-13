import React from "react";
import companies from "../data/companies";
import Navbar from "../components/Navbar.jsx";

const midpoint = Math.ceil(companies.length / 2);
const companiesRowOne = companies.slice(0, midpoint);
const companiesRowTwo = companies.slice(midpoint);
const logoCircleClassName =
  "logo-circle group relative flex items-center justify-center w-32 h-32 flex-shrink-0 mx-4 rounded-full floating-bubble";

const Landing = () => {
  return (
    <div className="relative min-h-screen text-slate-900 px-[5vw] py-6 flex flex-col font-sans overflow-x-hidden saas-section">
      <Navbar hideGuestCenterNav />
      <main className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.1fr] gap-12 items-center pt-24">
        <section
          className="flex justify-center order-first lg:order-last"
          aria-hidden="true"
        >
          <div className="w-full max-w-[520px] glass-panel overflow-hidden">
            <div className="flex gap-1.5 p-3 bg-white/60 backdrop-blur">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            </div>

            <div className="grid grid-cols-[1.1fr_0.9fr] p-5 gap-4">
              <div className="bg-white/70 border border-white/60 rounded-2xl p-4 shadow-sm">
                <div className="h-[7px] w-[70%] bg-[#cbe9a8] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e1f2d2] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e1f2d2] rounded-full mb-2"></div>
                <div className="h-3 bg-[#eef7e8] rounded-lg my-3"></div>
                <div className="h-[7px] w-[55%] bg-[#e1f2d2] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e1f2d2] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e1f2d2] rounded-full mb-2"></div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="self-end px-2.5 py-1 rounded-full text-[0.7rem] bg-[#e6f7ef] text-[#0f766e]">
                  Match 87%
                </div>
                <div className="bg-white/70 border border-white/60 rounded-2xl p-3 shadow-sm border-l-4 border-[#7bbf6a]">
                  <p className="text-[0.7rem] text-slate-500 mb-1.5">
                    High impact
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full mb-1.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="bg-white/70 border border-white/60 rounded-2xl p-3 shadow-sm border-l-4 border-[#a6d7a2]">
                  <p className="text-[0.7rem] text-slate-500 mb-1.5">
                    Suggestions
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full mb-1.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>
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
            <button className="btn-primary text-sm">Try it free</button>
            <button className="btn-secondary text-sm">See your dashboard</button>
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
