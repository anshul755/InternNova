import { Link } from "react-router-dom";
import Seo from "./Seo.jsx";

export default function LegalDocumentPage({
  title,
  description,
  path,
  effectiveDate,
  sections,
}) {
  return (
    <>
      <Seo title={title} description={description} path={path} />
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 text-slate-900 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <article className="glass-panel border border-white/60 p-6 sm:p-8 lg:p-10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Legal
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900">
                {title}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-3xl leading-7">
                {description}
              </p>

              <div className="mt-6 inline-flex items-center rounded-full border border-white/60 bg-white/50 px-4 py-2 text-sm text-slate-600">
                Effective Date: {effectiveDate}
              </div>

              <div className="mt-10 space-y-8">
                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 rounded-2xl border border-white/50 bg-white/35 p-5 sm:p-6"
                    aria-labelledby={`${section.id}-heading`}
                  >
                    <h2
                      id={`${section.id}-heading`}
                      className="text-xl font-semibold text-slate-900"
                    >
                      {index + 1}. {section.title}
                    </h2>
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${section.id}-${paragraphIndex}`}
                        className="mt-3 text-sm sm:text-[0.95rem] leading-7 text-slate-600"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.items?.length > 0 && (
                      <div className="mt-4">
                        {section.subheading && (
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {section.subheading}
                          </h3>
                        )}
                        <ul className="mt-3 space-y-2 text-sm sm:text-[0.95rem] text-slate-600">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-3 leading-7">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/" className="btn-secondary text-sm">
                  Back to Home
                </Link>
                <Link to="/jobs" className="btn-primary text-sm">
                  Explore Opportunities
                </Link>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="glass-panel border border-white/60 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  On This Page
                </h2>
                <nav className="mt-4" aria-label={`${title} table of contents`}>
                  <ol className="space-y-2">
                    {sections.map((section, index) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-colors"
                        >
                          {index + 1}. {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
