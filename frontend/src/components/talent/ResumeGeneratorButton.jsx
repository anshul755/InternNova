import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import { api } from "../../lib/api.js";
import {
  IoDocumentTextOutline,
  IoSparkles,
  IoClose,
  IoDownloadOutline,
  IoOpenOutline,
} from "react-icons/io5";

/* The two styles offered by the AI service (template registry). */
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

/* Theme tokens (work in both light & dark) — set as inline styles so the app's
   global element rules can't override them. */
const T = {
  text: "var(--app-text)",
  secondary: "var(--app-text-secondary)",
  muted: "var(--app-text-muted)",
  border: "var(--app-border-strong)",
  glassSoft: "var(--app-glass-soft)",
  accent: "var(--app-accent-end)",
};

/**
 * Talent-only navbar action: opens a modal to generate a PDF resume from the
 * user's profile via core-service (POST /talent/v1/resume -> AI service).
 */
export default function ResumeGeneratorButton({
  light = true,
  compact = false,
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

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

  const closeModal = () => {
    setOpen(false);
    setError("");
    revoke();
    setPdfUrl(null);
    setLatexSource("");
  };

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

  const triggerClasses = compact
    ? `flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-xl transition-all duration-300 border border-transparent w-full ${
        light
          ? "hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25 text-slate-700 hover:text-slate-900"
          : "hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25 text-slate-300 hover:text-white"
      }`
    : `inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 border border-transparent ${
        light
          ? "text-slate-700 hover:text-slate-900 hover:bg-[#7cc84a]/5 hover:border-[#7cc84a]/25"
          : "text-slate-300 hover:text-white hover:bg-[#9fe870]/5 hover:border-[#9fe870]/25"
      }`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={triggerClasses}
        style={compact ? { color: T.secondary } : undefined}
      >
        <IoSparkles className="w-4 h-4" style={{ color: T.accent }} />
        {compact ? "Generate Resume" : "Resume"}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Generate resume"
          >
            <button
              aria-label="Close"
              onClick={closeModal}
              className="absolute inset-0 cursor-default"
              style={{
                background: "var(--app-overlay)",
                backdropFilter: "blur(4px)",
              }}
            />

            <div
              className="glass-panel relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 animate-slide-down"
              style={{ color: T.text }}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span
                    className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
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
                    <h2
                      className="text-lg font-bold leading-tight"
                      style={{ color: T.text }}
                    >
                      Generate Resume
                    </h2>
                    <p
                      className="text-[0.8rem] mt-0.5"
                      style={{ color: T.muted }}
                    >
                      Built from your profile by AI — review before you send it.
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10 shrink-0"
                  style={{ color: T.muted }}
                  aria-label="Close"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    className="block text-[0.7rem] font-semibold uppercase tracking-wider mb-2.5"
                    style={{ color: T.muted }}
                  >
                    Template
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {TEMPLATES.map((t) => {
                      const selected = template === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTemplate(t.id)}
                          className="text-left rounded-2xl border p-3.5 transition-all"
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
                            <span
                              className="text-sm font-semibold"
                              style={{ color: T.text }}
                            >
                              {t.name}
                            </span>
                            <span
                              className="h-4 w-4 rounded-full border-2 grid place-items-center"
                              style={{
                                borderColor: selected ? T.accent : T.muted,
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
                          <p
                            className="text-xs mt-1 leading-snug"
                            style={{ color: T.muted }}
                          >
                            {t.blurb}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[0.7rem] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: T.muted }}
                    >
                      Phone{" "}
                      <span className="normal-case font-normal opacity-70">
                        (optional)
                      </span>
                    </label>
                    <input
                      className="input-glass"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[0.7rem] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: T.muted }}
                    >
                      Target role{" "}
                      <span className="normal-case font-normal opacity-70">
                        (optional)
                      </span>
                    </label>
                    <input
                      className="input-glass"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Intern"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[0.7rem] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: T.muted }}
                  >
                    Tailor to a job description{" "}
                    <span className="normal-case font-normal opacity-70">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="input-glass resize-y"
                    style={{ minHeight: "84px" }}
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste a job description to emphasise the most relevant experience and skills — stays grounded in your real profile."
                  />
                </div>

                {error && (
                  <div
                    className="rounded-xl px-3.5 py-2.5 text-sm"
                    style={{
                      background: "rgba(220,38,38,0.12)",
                      border: "1px solid rgba(248,113,113,0.35)",
                      color: "#fca5a5",
                    }}
                  >
                    {error}
                  </div>
                )}

                {pdfUrl && (
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${T.border}` }}
                  >
                    <iframe
                      title="Resume preview"
                      src={pdfUrl}
                      className="w-full h-[440px]"
                      style={{ background: "#fff" }}
                    />
                  </div>
                )}
              </div>

              <div
                className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4"
                style={{ borderTop: `1px solid ${T.border}` }}
              >
                <p className="text-xs" style={{ color: T.muted }}>
                  Generation can take ~15–30s.
                </p>
                <div className="flex items-center gap-2">
                  {pdfUrl && (
                    <>
                      <button
                        onClick={handleDownloadLatex}
                        className="btn-secondary !px-4 !py-2 !text-sm"
                      >
                        <IoDownloadOutline className="w-4 h-4" /> Download LaTeX
                      </button>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary !px-4 !py-2 !text-sm"
                      >
                        <IoOpenOutline className="w-4 h-4" /> Open
                      </a>
                      <button
                        onClick={handleDownload}
                        className="btn-secondary !px-4 !py-2 !text-sm"
                      >
                        <IoDownloadOutline className="w-4 h-4" /> Download
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn-primary !px-5 !py-2 !text-sm min-w-[8.5rem] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span
                          className="h-4 w-4 rounded-full animate-spin"
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
          </div>,
          document.body,
        )}
    </>
  );
}
