r"""LaTeX template builders.

Two registered styles, both authored for `pdflatex` + stock TeX Live packages:

  - classic : ATS-friendly, single column (modelled on the ATS-friendly sample).
  - modern  : two-column with a shaded sidebar (modelled on the two-sided sample),
              built with `paracol`.

Each builder takes the deterministic `ContactInfo` plus the LLM-written `ResumeContent`
and returns a complete `.tex` string. Every field is passed through `esc()` / `esc_url()`
here — this module IS the "escape LaTeX special characters" + "assemble .tex" step. Add a
new style by writing a builder and registering it in `TEMPLATES`.
"""

from typing import Callable, Dict, List

from app.features.resume_generator.latex import esc, esc_url
from app.features.resume_generator.schemas import (
    ContactInfo,
    ResumeContent,
    TemplateStyle,
)

DOT = r" $\cdot$ "


def _bullets(items: List[str]) -> str:
    """A compact itemize, or empty string when there are no bullets."""
    rows = [esc(b) for b in items if b and b.strip()]
    if not rows:
        return ""
    body = "\n".join(rf"  \item {r}" for r in rows)
    return "\\begin{itemize}\n" + body + "\n\\end{itemize}"


def _link(label: str, url: str) -> str:
    """`label: \\href{url}{display}` where display is the url without its scheme."""
    display = str(url).split("://", 1)[-1].rstrip("/")
    return rf"{label}: \href{{{esc_url(url)}}}{{{esc(display)}}}"


def _contact_links(c: ContactInfo) -> List[str]:
    out: List[str] = []
    if c.linkedin:
        out.append(_link("LinkedIn", c.linkedin))
    if c.github:
        out.append(_link("GitHub", c.github))
    if c.portfolio:
        out.append(_link("Portfolio", c.portfolio))
    return out


# ── classic (ATS, single column) ──────────────────────────────────────────────

_CLASSIC_PREAMBLE = r"""\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage[margin=0.6in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}
\usepackage{xcolor}

\setlist[itemize]{leftmargin=1.4em,topsep=2pt,itemsep=1pt,parsep=0pt}
\titleformat{\section}{\large\bfseries\scshape}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{8pt}{4pt}
\pagestyle{empty}
\setlength{\parindent}{0pt}
"""


def _classic_header(c: ContactInfo) -> str:
    line1 = [esc(x) for x in (c.location, c.phone) if x]
    if c.email:
        line1.append(rf"\href{{mailto:{esc_url(c.email)}}}{{{esc(c.email)}}}")
    contact = DOT.join(line1)
    links = DOT.join(_contact_links(c))
    parts = [
        r"\begin{center}",
        rf"{{\LARGE \textbf{{{esc(c.name)}}}}}\\[4pt]",
    ]
    if contact:
        parts.append(rf"{contact}\\[2pt]")
    if links:
        parts.append(links)
    parts.append(r"\end{center}")
    return "\n".join(parts)


def _classic_entry(title: str, right: str, subtitle: str, bullets: List[str]) -> str:
    lines = []
    head = rf"\textbf{{{esc(title)}}}"
    if right:
        head += rf"\hfill {esc(right)}"
    lines.append(head + r"\\")
    if subtitle:
        lines.append(rf"\textit{{{esc(subtitle)}}}")
    b = _bullets(bullets)
    if b:
        lines.append(b)
    lines.append(r"\vspace{4pt}")
    return "\n".join(lines)


def build_classic(contact: ContactInfo, content: ResumeContent) -> str:
    parts = [_CLASSIC_PREAMBLE, r"\begin{document}", _classic_header(contact)]

    if content.summary and content.summary.strip():
        parts.append(r"\section{Summary}")
        parts.append(esc(content.summary))

    if content.skillGroups:
        parts.append(r"\section{Skills}")
        rows = [
            rf"\textbf{{{esc(g.category)}}}: {esc(', '.join(g.skills))}\\"
            for g in content.skillGroups
            if g.skills
        ]
        parts.append("\n".join(rows))

    if content.experience:
        parts.append(r"\section{Experience}")
        for e in content.experience:
            title = ", ".join(x for x in (e.role, e.company) if x)
            parts.append(_classic_entry(title, e.dateRange or "", e.location or "", e.bullets))

    if content.projects:
        parts.append(r"\section{Projects}")
        for p in content.projects:
            right = ""
            if p.link:
                display = str(p.link).split("://", 1)[-1].rstrip("/")
                right = rf"\href{{{esc_url(p.link)}}}{{{esc(display)}}}"
            sub = p.subtitle or ""
            # link goes on the right; render entry manually to allow a raw href there
            head = rf"\textbf{{{esc(p.name)}}}"
            if right:
                head += rf"\hfill {right}"
            block = [head + r"\\"]
            if sub:
                block.append(rf"\textit{{{esc(sub)}}}")
            b = _bullets(p.bullets)
            if b:
                block.append(b)
            block.append(r"\vspace{4pt}")
            parts.append("\n".join(block))

    if content.education:
        parts.append(r"\section{Education}")
        for ed in content.education:
            sub = ", ".join(x for x in (ed.degree, ed.details) if x)
            parts.append(_classic_entry(ed.institution, ed.dateRange or "", sub, []))

    if content.certifications:
        parts.append(r"\section{Certifications}")
        rows = []
        for cert in content.certifications:
            meta = ", ".join(x for x in (cert.issuer, cert.date) if x)
            line = esc(cert.name) + (rf" \textit{{({esc(meta)})}}" if meta else "")
            rows.append(rf"\item {line}")
        parts.append("\\begin{itemize}\n" + "\n".join(rows) + "\n\\end{itemize}")

    if content.achievements:
        parts.append(r"\section{Achievements}")
        rows = [rf"\item {esc(a)}" for a in content.achievements if a and a.strip()]
        if rows:
            parts.append("\\begin{itemize}\n" + "\n".join(rows) + "\n\\end{itemize}")

    parts.append(r"\end{document}")
    return "\n".join(parts)


# ── modern (two-column, shaded sidebar) ───────────────────────────────────────

_MODERN_PREAMBLE = r"""\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage[margin=0pt]{geometry}
\usepackage{paracol}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}

\definecolor{accent}{RGB}{37,99,135}
\definecolor{sidebar}{RGB}{238,242,245}
\definecolor{sidetext}{RGB}{40,46,52}

\setlength{\parindent}{0pt}
\pagestyle{empty}
\setlist[itemize]{leftmargin=1.1em,topsep=2pt,itemsep=1pt,parsep=0pt}

% Section headers
\newcommand{\sidesection}[1]{\par\vspace{9pt}{\bfseries\color{accent}\large #1}\par
  \vspace{1pt}\textcolor{accent}{\rule{\linewidth}{0.6pt}}\par\vspace{3pt}}
\newcommand{\mainsection}[1]{\par\vspace{11pt}{\bfseries\color{accent}\Large #1}\par
  \vspace{1pt}\textcolor{accent}{\rule{\linewidth}{1pt}}\par\vspace{4pt}}
"""


def _modern_sidebar(contact: ContactInfo, content: ResumeContent) -> str:
    parts: List[str] = []

    # Contact
    contact_rows = []
    if contact.location:
        contact_rows.append(esc(contact.location))
    if contact.phone:
        contact_rows.append(esc(contact.phone))
    if contact.email:
        contact_rows.append(rf"\href{{mailto:{esc_url(contact.email)}}}{{{esc(contact.email)}}}")
    if contact_rows:
        parts.append(r"\sidesection{Contact}")
        parts.append(r"\\".join(contact_rows))

    links = _contact_links(contact)
    if links:
        parts.append(r"\sidesection{Links}")
        parts.append(r"\\".join(links))

    if content.education:
        parts.append(r"\sidesection{Education}")
        for ed in content.education:
            block = [rf"\textbf{{{esc(ed.institution)}}}\\"]
            extra = [esc(x) for x in (ed.degree, ed.dateRange, ed.details) if x]
            if extra:
                block.append(r"\\".join(extra))
            parts.append("\n".join(block) + r"\\[4pt]")

    if content.skillGroups:
        parts.append(r"\sidesection{Skills}")
        for g in content.skillGroups:
            if not g.skills:
                continue
            parts.append(rf"\textbf{{{esc(g.category)}}}\\")
            parts.append(esc(", ".join(g.skills)) + r"\\[3pt]")

    if content.certifications:
        parts.append(r"\sidesection{Certifications}")
        rows = []
        for cert in content.certifications:
            meta = ", ".join(x for x in (cert.issuer, cert.date) if x)
            rows.append(esc(cert.name) + (rf" ({esc(meta)})" if meta else ""))
        parts.append(r"\\".join(rows))

    if content.achievements:
        parts.append(r"\sidesection{Achievements}")
        rows = [rf"\item {esc(a)}" for a in content.achievements if a and a.strip()]
        if rows:
            parts.append("\\begin{itemize}\n" + "\n".join(rows) + "\n\\end{itemize}")

    return "\n".join(parts)


def _modern_main(contact: ContactInfo, content: ResumeContent) -> str:
    parts: List[str] = [rf"{{\Huge \bfseries {esc(contact.name)}}}\par\vspace{{4pt}}"]

    if content.summary and content.summary.strip():
        parts.append(r"\mainsection{Profile}")
        parts.append(esc(content.summary))

    if content.experience:
        parts.append(r"\mainsection{Experience}")
        for e in content.experience:
            title = ", ".join(x for x in (e.role, e.company) if x)
            head = rf"\textbf{{{esc(title)}}}"
            if e.dateRange:
                head += rf"\hfill {esc(e.dateRange)}"
            block = [head + r"\\"]
            if e.location:
                block.append(rf"\textit{{{esc(e.location)}}}")
            b = _bullets(e.bullets)
            if b:
                block.append(b)
            block.append(r"\vspace{4pt}")
            parts.append("\n".join(block))

    if content.projects:
        parts.append(r"\mainsection{Projects}")
        for p in content.projects:
            head = rf"\textbf{{{esc(p.name)}}}"
            if p.link:
                display = str(p.link).split("://", 1)[-1].rstrip("/")
                head += rf"\hfill \href{{{esc_url(p.link)}}}{{{esc(display)}}}"
            block = [head + r"\\"]
            if p.subtitle:
                block.append(rf"\textit{{{esc(p.subtitle)}}}")
            b = _bullets(p.bullets)
            if b:
                block.append(b)
            block.append(r"\vspace{4pt}")
            parts.append("\n".join(block))

    return "\n".join(parts)


def build_modern(contact: ContactInfo, content: ResumeContent) -> str:
    body = [
        _MODERN_PREAMBLE,
        r"\begin{document}",
        r"\columnratio{0.34}",
        r"\setlength{\columnsep}{0pt}",
        r"\begin{paracol}{2}",
        r"\backgroundcolor{c[0]}{sidebar}",
        # left column: padded sidebar
        r"\color{sidetext}\hspace{0.18in}\begin{minipage}{\dimexpr\linewidth-0.36in\relax}"
        r"\vspace{0.3in}",
        _modern_sidebar(contact, content),
        r"\vspace{0.3in}\end{minipage}",
        r"\switchcolumn",
        # right column: padded main
        r"\hspace{0.12in}\begin{minipage}{\dimexpr\linewidth-0.5in\relax}\vspace{0.3in}",
        _modern_main(contact, content),
        r"\vspace{0.3in}\end{minipage}",
        r"\end{paracol}",
        r"\end{document}",
    ]
    return "\n".join(body)


# ── registry ──────────────────────────────────────────────────────────────────

TEMPLATES: Dict[TemplateStyle, Callable[[ContactInfo, ResumeContent], str]] = {
    TemplateStyle.classic: build_classic,
    TemplateStyle.modern: build_modern,
}


def render_template(
    style: TemplateStyle, contact: ContactInfo, content: ResumeContent
) -> str:
    builder = TEMPLATES.get(style)
    if builder is None:  # pragma: no cover - guarded by the enum
        raise ValueError(f"Unsupported template style: {style}")
    return builder(contact, content)
