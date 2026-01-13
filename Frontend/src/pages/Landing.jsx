import React from "react";
import { Link } from "react-router-dom";
import companies from "../data/companies";

const midpoint = Math.ceil(companies.length / 2);
const companiesRowOne = companies.slice(0, midpoint);
const companiesRowTwo = companies.slice(midpoint);

const Landing = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1923c4_0%,#0a5bff_40%,#0c1b66_100%)] text-white px-[5vw] py-6 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#36e4ff] to-[#02c39a] flex items-center justify-center font-bold">
            IN
          </div>
          <span className="font-semibold tracking-wider">InternNova</span>
        </div>

        <nav className="hidden md:flex gap-5 text-[0.95rem]">
          <a
            href="#features"
            className="text-[#e5ecff] hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[#e5ecff] hover:text-white transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-[#e5ecff] hover:text-white transition-colors"
          >
            Pricing
          </a>
        </nav>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium hover:bg-[#0a16504d] transition-all"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-white text-[#0a1f5b] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#f2f4ff] hover:-translate-y-px transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.1fr] gap-12 items-center pt-16">
        {/* Hero Visual (Top on mobile) */}
        <section
          className="flex justify-center order-first lg:order-last"
          aria-hidden="true"
        >
          <div className="w-full max-w-[520px] rounded-3xl bg-[#f8f9ff] shadow-[0_28px_60px_rgba(4,5,40,0.6)] overflow-hidden">
            <div className="flex gap-1.5 p-3 bg-gradient-to-r from-[#101835] to-[#060b1c]">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            </div>

            <div className="grid grid-cols-[1.1fr_0.9fr] p-5 gap-4">
              {/* Resume Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="h-[7px] w-[70%] bg-[#c7d2ff] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e3e8ff] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e3e8ff] rounded-full mb-2"></div>
                <div className="h-3 bg-[#eef1ff] rounded-lg my-3"></div>
                <div className="h-[7px] w-[55%] bg-[#e3e8ff] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e3e8ff] rounded-full mb-2"></div>
                <div className="h-[7px] bg-[#e3e8ff] rounded-full mb-2"></div>
              </div>

              {/* Insights */}
              <div className="flex flex-col gap-3">
                <div className="self-end px-2.5 py-1 rounded-full text-[0.7rem] bg-[#e0fce8] text-[#047857]">
                  Match 87%
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border-l-4 border-[#16a34a]">
                  <p className="text-[0.7rem] text-slate-500 mb-1.5">
                    High impact
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full mb-1.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border-l-4 border-[#f59e0b]">
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

        {/* Hero Content */}
        <section>
          <p className="uppercase tracking-[0.16em] text-[0.75rem] text-[#c2d5ff]">
            AI-powered resume matcher
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] my-4">
            Land your dream internship faster.
          </h1>
          <p className="max-w-lg text-[#d1ddff] text-base">
            InternNova compares your resume with any job posting, highlights
            missing skills, and suggests tailored keywords so recruiters see
            your best work first.
          </p>

          <div className="flex flex-wrap gap-3 my-7">
            <button className="bg-[#36e4ff] text-[#061548] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#24cbe4] transition-colors">
              View Example Match
            </button>
            <button className="bg-transparent border border-white/60 px-5 py-2 rounded-full text-sm font-medium hover:bg-[#08165080] transition-colors">
              Try it free
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-[0.85rem] text-[#c2d5ff]">
            {[
              "Skill gap insights",
              "Match score dashboard",
              "ATS-friendly suggestions",
            ].map((text) => (
              <span
                key={text}
                className="bg-[#050d3c99] px-4 py-1.5 rounded-full"
              >
                ✔ {text}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Companies Section */}
      <section className="mt-16 -mx-[5vw]">
        <div className="relative w-full overflow-hidden py-16 pb-20 space-y-10">
          {/* Top row: scroll left */}
          <div className="flex animate-scroll-left w-max">
            {companiesRowOne.map((company, idx) => (
              <a
                key={`row1-first-${idx}`}
                href={company.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-32 h-32 flex-shrink-0 mx-4 bg-white rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300"
                title={company.name}
              >
                <div className="w-20 h-20 flex items-center justify-center p-2">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = document.createElement("span");
                      fallback.className = "text-2xl font-bold text-gray-700";
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
                className="group relative flex items-center justify-center w-32 h-32 flex-shrink-0 mx-4 bg-white rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300"
                title={company.name}
              >
                <div className="w-20 h-20 flex items-center justify-center p-2">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = document.createElement("span");
                      fallback.className = "text-2xl font-bold text-gray-700";
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

          {/* Bottom row: scroll right with remaining unique companies */}
          {companiesRowTwo.length > 0 && (
            <div className="flex animate-scroll-right w-max">
              {companiesRowTwo.map((company, idx) => (
                <a
                  key={`row2-first-${idx}`}
                  href={company.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-32 h-32 flex-shrink-0 mx-4 bg-white rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300"
                  title={company.name}
                >
                  <div className="w-20 h-20 flex items-center justify-center p-2">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = document.createElement("span");
                        fallback.className = "text-2xl font-bold text-gray-700";
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
                  className="group relative flex items-center justify-center w-32 h-32 flex-shrink-0 mx-4 bg-white rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300"
                  title={company.name}
                >
                  <div className="w-20 h-20 flex items-center justify-center p-2">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = document.createElement("span");
                        fallback.className = "text-2xl font-bold text-gray-700";
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

      {/* Add infinite scroll animation styles */}
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
        
        .animate-scroll-left {
          animation: scroll-left 50s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 50s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
