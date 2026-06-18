import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext.jsx";
import { api } from "../lib/api.js";
import {
  IoDocumentTextOutline,
  IoSparkles,
  IoDownloadOutline,
  IoOpenOutline,
} from "react-icons/io5";
import Seo from "../components/Seo.jsx";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    blurb: "ATS-friendly, single column. Safe for application portals.",
  },
  {
    id: "modern",
    name: "Modern",
    blurb: "Two-column with a colored sidebar. More visual.",
  },
];

const T = {
  text: "var(--app-text)",
  secondary: "var(--app-text-secondary)",
  muted: "var(--app-text-muted)",
  border: "var(--app-border-strong)",
  glassSoft: "var(--app-glass-soft)",
  accent: "var(--app-accent-end)",
};

export default function ResumeGenerator() {
  const { user } = useAuth();
  const [template, setTemplate] = useState("classic");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [latexSource, setLatexSource] = useState("");

  const objectUrlRef = useRef(null);

  const revoke = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => () => revoke(), []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    revoke();
    setPdfUrl(null);
    setLatexSource("");
    try {
      const res = await api.post("/talent/v1/resume", {
        template,
        email: user?.email,
        phone: phone.trim() || null,
        jobTitle: jobTitle.trim() || null,
        jobDescription: jobDescription.trim() || null,
      });
      const data = await res.json();
      setLatexSource(data.tex || "");
      const bytes = Uint8Array.from(atob(data.pdfBase64), (c) =>
        c.charCodeAt(0),
      );
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setPdfUrl(url);
    } catch (e) {
      setError(e?.message || "Failed to generate resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `resume-${template}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handleDownloadLatex() {
    if (!latexSource) return;
    const blob = new Blob([latexSource], {
      type: "application/x-tex;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${template}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo
        title="InternNova | Generate Resume"
        description="Build an AI-tailored resume based on your profile details and target job description."
        path="/resume-generator"
      />

      <div className="flex items-center gap-3.5 mb-8">
        <span
          className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, var(--app-accent-start), var(--app-accent-end))`,
            boxShadow: "0 8px 22px rgba(124,200,74,0.30)",
          }}
        >
          <IoDocumentTextOutline
            className="w-6 h-6"
            style={{ color: "var(--app-button-text)" }}
          />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            AI Resume Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and optimize an ATS-friendly resume directly from your profile data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.10fr] gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="glass-panel p-6 sm:p-7 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <IoSparkles className="w-4 h-4 text-lime-500" /> Tailoring Options
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Template Style
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => {
                    const selected = template === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id)}
                        className="text-left rounded-2xl border p-4 transition-all focus:outline-none"
                        style={
                          selected
                            ? {
                                borderColor: T.accent,
                                background: "rgba(159,232,112,0.12)",
                                boxShadow: "0 0 0 1px rgba(159,232,112,0.35)",
                              }
                            : {
                                borderColor: T.border,
                                background: T.glassSoft,
                              }
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t.name}
                          </span>
                          <span
                            className="h-4 w-4 rounded-full border-2 grid place-items-center"
                            style={{
                              borderColor: selected ? T.accent : "var(--app-text-muted)",
                              background: selected ? T.accent : "transparent",
                            }}
                          >
                            {selected && (
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background: "var(--app-button-text)",
                                }}
                              />
                            )}
                          </span>
                        </div>
                        <p className="text-xs mt-1.5 leading-snug text-slate-500 dark:text-slate-400">
                          {t.blurb}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Phone <span className="normal-case font-normal opacity-70">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    className="input-glass w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Target Role <span className="normal-case font-normal opacity-70">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input-glass w-full"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Frontend Intern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Tailor to Job Description <span className="normal-case font-normal opacity-70">(optional)</span>
                </label>
                <textarea
                  className="input-glass w-full resize-y"
                  style={{ minHeight: "120px" }}
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job description to emphasise the most relevant experience and skills — stays grounded in your real profile."
                />
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm border"
                  style={{
                    background: "rgba(220,38,38,0.12)",
                    borderColor: "rgba(248,113,113,0.35)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generation takes ~15–30s.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary !px-6 !py-2.5 !text-sm min-w-[9rem] justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span
                        className="h-4 w-4 rounded-full animate-spin mr-2"
                        style={{
                          border: "2px solid currentColor",
                          borderTopColor: "transparent",
                        }}
                      />
                      Generating…
                    </>
                  ) : pdfUrl ? (
                    "Regenerate"
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PDF Preview / PDF Download & Actions */}
        <div className="glass-panel p-6 sm:p-7 flex flex-col h-full min-h-[500px]">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center justify-between">
            <span>Resume Preview</span>
            {pdfUrl && (
              <span className="text-xs font-medium px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                Ready
              </span>
            )}
          </h2>

          {pdfUrl ? (
            <div className="flex-1 flex flex-col gap-4">
              <div
                className="flex-1 rounded-xl overflow-hidden border bg-white"
                style={{ borderColor: T.border }}
              >
                <iframe
                  title="Resume preview"
                  src={pdfUrl}
                  className="w-full h-[460px] lg:h-[500px] border-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadLatex}
                    className="btn-secondary !px-3.5 !py-2 !text-xs"
                    title="Download LaTeX Source Code"
                  >
                    <IoDownloadOutline className="w-4 h-4 mr-1" /> LaTeX
                  </button>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary !px-3.5 !py-2 !text-xs"
                  >
                    <IoOpenOutline className="w-4 h-4 mr-1" /> Open full tab
                  </a>
                </div>
                <button
                  onClick={handleDownload}
                  className="btn-primary !px-5 !py-2 !text-xs font-semibold"
                >
                  <IoDownloadOutline className="w-4 h-4 mr-1.5" /> Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
              <IoDocumentTextOutline className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Preview Available
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Fill out the tailoring options on the left and click **Generate** to create your AI resume.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
