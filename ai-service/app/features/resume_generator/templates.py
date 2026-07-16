r"""LaTeX template builders.

Two registered styles, both authored as a single self-contained `.tex` for `xelatex`
+ stock TeX Live packages (fontspec, geometry, xcolor, enumitem, titlesec, paracol,
hyperref, lato):

  - classic : Trey Hunner "Medium Length Professional CV" recreated by inlining the
              resume.cls macros (\name/\address/rSection/rSubsection) onto `article`.
  - modern  : the `deedy-resume-openfont` look recreated with a two-column paracol
              layout, Lato typeface via fontspec, and colored section headers.

Both templates use `fontspec` (XeLaTeX-native) instead of the pdflatex-only
`fontenc`/`inputenc` packages. This matches the production engine (`xelatex`) set in
the Dockerfile and docker-compose.

Each builder takes the deterministic `ContactInfo` plus the LLM-written `ResumeContent`
and returns a complete `.tex` string. Every field is passed through `esc()` / `esc_url()`
here — this module IS the "escape LaTeX special characters" + "assemble .tex" step. Add a
new style by writing a builder and registering it in `TEMPLATES`.
"""

import re
from typing import Callable, Dict, List

from app.features.resume_generator.latex import esc, esc_url
from app.features.resume_generator.schemas import (
    ContactInfo,
    ResumeContent,
    TemplateStyle,
)

DIAMOND = r" $\diamond$ "
BULLDOT = r" $\bullet$ "


def _ul(items: List[str], env: str = "itemize", raw: bool = False) -> str:
    """A bullet list in the given list environment, or '' when there are no items.

    `raw=True` means the items already contain assembled/escaped LaTeX (e.g. a name
    plus an italic meta span) and must NOT be escaped again — passing such items with
    the default would turn `\\textit{...}` into literal text.
    """
    rows = [(b if raw else esc(b)) for b in items if b and b.strip()]
    if not rows:
        return ""
    body = "\n".join(rf"  \item {r}" for r in rows)
    return f"\\begin{{{env}}}\n{body}\n\\end{{{env}}}"


# ── link helpers ──────────────────────────────────────────────────────────────

# Canonical platform names keyed by domain pattern — first match wins.
_PLATFORM_LABELS = [
    (r"github\.com", "GitHub"),
    (r"gitlab\.com", "GitLab"),
    (r"bitbucket\.org", "Bitbucket"),
    (r"linkedin\.com", "LinkedIn"),
    (r"leetcode\.com", "LeetCode"),
    (r"codeforces\.(com|ru)", "Codeforces"),
    (r"hackerrank\.com", "HackerRank"),
    (r"codepen\.io", "CodePen"),
    (r"dev\.to", "Dev.to"),
    (r"medium\.com", "Medium"),
    (r"dribbble\.com", "Dribbble"),
    (r"behance\.net", "Behance"),
    (r"figma\.com", "Figma"),
    (r"stackoverflow\.com", "Stack Overflow"),
    (r"netlify\.(com|app)", "Netlify"),
    (r"vercel\.(com|app)", "Vercel"),
    (r"heroku\.(com|app)", "Heroku"),
    (r"firebase\.(com|app)", "Firebase"),
    (r"pages\.dev", "Cloudflare"),
    (r"twitter\.com", "Twitter"),
    (r"x\.com", "X"),
]


def _link_label(url: str) -> str:
    """Return a human-friendly platform label for *url*.

    Matches known platforms (GitHub, GitLab, …); for unrecognised hosts falls back to
    the bare domain (e.g. ``example.com``) so the label stays compact and meaningful.
    """
    if not url:
        return "Link"
    text = str(url).strip()
    # Extract the host part (ignore scheme, path, query, fragment).
    host = text
    if "://" in host:
        host = host.split("://", 1)[1]
    host = host.split("/", 1)[0].split("?")[0].split("#")[0].lower().strip()
    if not host:
        return "Link"
    for pattern, label in _PLATFORM_LABELS:
        if re.search(pattern, host):
            return label
    # Generic fallback: bare domain, minus any `www.` prefix.
    return re.sub(r"^www\.", "", host)


def _href(url: str, display: str = "") -> str:
    r"""Return ``\href{url}{display}`` for safe insertion into a LaTeX document.

    When *display* is omitted a platform label is derived from the URL (e.g. "GitHub")
    so that inline links stay compact and professional looking.
    """
    text = display or _link_label(url)
    return rf"\href{{{esc_url(url)}}}{{{esc(text)}}}"


def _split_name(full: str) -> tuple:
    """Split a full name into (first, rest) for the two-tone modern header."""
    parts = (full or "Candidate").strip().split(None, 1)
    return (parts[0], parts[1] if len(parts) > 1 else "")


# ── classic — Trey Hunner resume.cls, inlined onto article ────────────────────

_CLASSIC_PREAMBLE = r"""\documentclass[11pt,a4paper]{article}
% XeLaTeX is Unicode-native: fontenc/inputenc must not be loaded under xelatex.
% fontspec replaces them and enables full UTF-8 / OpenType support.
\usepackage{fontspec}
\usepackage[left=0.45in,top=0.35in,right=0.45in,bottom=0.35in]{geometry}
\usepackage{array}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{titlesec}

\pagestyle{empty}
\setcounter{secnumdepth}{0}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}

% --- name + address header (resume.cls style) ---
\newcommand{\resname}[1]{\begin{center}{\Huge\bfseries #1}\end{center}\vspace{1pt}}
\newcommand{\resaddress}[1]{\begin{center}\small #1\end{center}}

% --- rSection: uppercase bold heading + full-width rule ---
\titleformat{\section}{\large\bfseries}{}{0em}{\MakeUppercase}[\vspace{-6pt}\rule{\linewidth}{0.8pt}]
\titlespacing{\section}{0pt}{7pt}{3pt}

% --- compact bullet lists with a diamond/cdot marker ---
\setlist[itemize]{leftmargin=1.5em,labelsep=0.5em,label=$\cdot$,topsep=2pt,itemsep=1pt,parsep=0pt}
"""


def _classic_entry(title: str, right: str, subtitle: str, bullets: List[str],
                   right_raw: bool = False) -> str:
    """resume.cls rSubsection: title \\hfill date, italic subtitle, then bullets."""
    head = rf"\textbf{{{esc(title)}}}"
    if right:
        head += rf"\hfill {right if right_raw else esc(right)}"
    lines = [head + r"\\*[2pt]"]
    if subtitle:
        lines.append(rf"\textit{{{esc(subtitle)}}}")
    b = _ul(bullets)
    if b:
        lines.append(b)
    lines.append(r"\vspace{4pt}")
    return "\n".join(lines)


def build_classic(contact: ContactInfo, content: ResumeContent) -> str:
    parts: List[str] = [_CLASSIC_PREAMBLE, r"\begin{document}"]

    # header
    parts.append(rf"\resname{{{esc(contact.name)}}}")
    line1 = [esc(contact.location)] if contact.location else []
    contact_bits = []
    if contact.phone:
        contact_bits.append(esc(contact.phone))
    if contact.email:
        contact_bits.append(rf"\href{{mailto:{esc_url(contact.email)}}}{{{esc(contact.email)}}}")
    links = []
    if contact.linkedin:
        links.append(_href(contact.linkedin))
    if contact.github:
        links.append(_href(contact.github))
    if contact.portfolio:
        links.append(_href(contact.portfolio))
    if line1:
        parts.append(rf"\resaddress{{{line1[0]}}}")
    if contact_bits:
        parts.append(rf"\resaddress{{{DIAMOND.join(contact_bits)}}}")
    if links:
        parts.append(rf"\resaddress{{{DIAMOND.join(links)}}}")

    if content.summary and content.summary.strip():
        parts.append(r"\section{Summary}")
        parts.append(esc(content.summary))

    if content.education:
        parts.append(r"\section{Education}")
        for ed in content.education:
            head = rf"\textbf{{{esc(ed.institution)}}}"
            if ed.dateRange:
                head += rf"\hfill {esc(ed.dateRange)}"
            block = [head + r"\\*[2pt]"]
            sub = ", ".join(x for x in (ed.degree, ed.details) if x)
            if sub:
                block.append(esc(sub))
            block.append(r"\vspace{4pt}")
            parts.append("\n".join(block))

    if content.skillGroups:
        parts.append(r"\section{Skills \& Interests}")
        rows = [
            rf"{esc(g.category)} & {esc(', '.join(g.skills))}\\"
            for g in content.skillGroups
            if g.skills
        ]
        parts.append(
            r"\begin{tabular}{ @{} >{\bfseries}l @{\hspace{4ex}} "
            r"p{0.78\textwidth} }"
            + "\n" + "\n".join(rows) + "\n" + r"\end{tabular}"
        )

    if content.experience:
        parts.append(r"\section{Experience}")
        for e in content.experience:
            title = ", ".join(x for x in (e.role, e.company) if x)
            parts.append(_classic_entry(title, e.dateRange or "", e.location or "", e.bullets))

    if content.projects:
        parts.append(r"\section{Projects}")
        for p in content.projects:
            right = _href(p.link) if p.link else ""
            parts.append(
                _classic_entry(p.name, right, p.subtitle or "", p.bullets, right_raw=True)
            )

    if content.certifications:
        parts.append(r"\section{Certifications}")
        rows = []
        for c in content.certifications:
            meta = ", ".join(x for x in (c.issuer, c.date) if x)
            rows.append(esc(c.name) + (rf" \textit{{({esc(meta)})}}" if meta else ""))
        parts.append(_ul(rows, raw=True))

    if content.achievements:
        parts.append(r"\section{Achievements}")
        parts.append(_ul(content.achievements))

    parts.append(r"\end{document}")
    return "\n".join(parts)


# ── modern — deedy-resume-openfont look, recreated for pdflatex ───────────────

_MODERN_PREAMBLE = r"""\documentclass[a4paper]{article}
% XeLaTeX is Unicode-native: fontenc/inputenc are not needed and must not be loaded.
% fontspec provides font management; helvet is the fallback if Lato is unavailable.
\usepackage{fontspec}
\usepackage[left=0.55in,top=0.5in,right=0.55in,bottom=0.5in]{geometry}
% Lato via fontspec (system OTF/TTF installed by `fonts-lato` or texlive-fonts-extra).
% IfFontExistsTF lets us fall back gracefully to Helvetica if Lato is not installed.
\usepackage{ifthen}
\IfFontExistsTF{Lato}{
  \setmainfont{Lato}
  \setsansfont{Lato}
}{
  \usepackage{helvet}
  \renewcommand{\familydefault}{\sfdefault}
}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{paracol}
\usepackage[hidelinks]{hyperref}
\raggedbottom

\definecolor{primary}{HTML}{2B2B2B}
\definecolor{headings}{HTML}{6A6A6A}
\definecolor{subheadings}{HTML}{333333}
\definecolor{accent}{HTML}{2A7DAA}

\pagestyle{empty}
\setcounter{secnumdepth}{0}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\hypersetup{colorlinks=true,urlcolor=accent}

% deedy-style section header: uppercase, colored, ruled
\titleformat{\section}{\Large\bfseries\color{headings}}{}{0em}{\MakeUppercase}[\textcolor{accent}{\titlerule[1pt]}]
\titlespacing{\section}{0pt}{10pt}{4pt}
\titleformat{\subsection}{\bfseries\color{subheadings}}{}{0em}{}
\titlespacing{\subsection}{0pt}{4pt}{1pt}

\newcommand{\runsub}[1]{{\bfseries\color{primary} #1}}
\newcommand{\descript}[1]{{\scshape\color{accent} #1}}
\newcommand{\loc}[1]{{\small\itshape\color{subheadings} #1}}

\newlist{tight}{itemize}{1}
\setlist[tight]{leftmargin=1.1em,labelsep=0.4em,label=$\bullet$,topsep=1pt,itemsep=1pt,parsep=0pt}
"""


def _modern_entry(title: str, descript: str, location: str, bullets: List[str],
                  link: str = "") -> str:
    head = rf"\runsub{{{esc(title)}}}"
    if descript:
        head += rf"~\descript{{| {esc(descript)}}}"
    lines = [head + r"\\*"]
    loc_bits = []
    if location:
        loc_bits.append(rf"\loc{{{esc(location)}}}")
    if link:
        loc_bits.append(_href(link))
    if loc_bits:
        lines.append(" \\hfill ".join(loc_bits) + r"\\*[1pt]" if len(loc_bits) > 1
                     else loc_bits[0] + r"\\*[1pt]")
    b = _ul(bullets, env="tight")
    if b:
        lines.append(b)
    lines.append(r"\vspace{5pt}")
    return "\n".join(lines)


def _modern_left(contact: ContactInfo, content: ResumeContent) -> str:
    parts: List[str] = []

    if content.education:
        parts.append(r"\section{Education}")
        for ed in content.education:
            parts.append(rf"\runsub{{{esc(ed.institution)}}}\\*")
            meta = [esc(x) for x in (ed.degree, ed.dateRange, ed.details) if x]
            if meta:
                parts.append(r"\loc{" + r" \\ ".join(meta) + r"}")
            parts.append(r"\vspace{6pt}")

    links = []
    if contact.linkedin:
        links.append(("LinkedIn", contact.linkedin))
    if contact.github:
        links.append(("GitHub", contact.github))
    if contact.portfolio:
        links.append(("Portfolio", contact.portfolio))
    if links:
        parts.append(r"\section{Links}")
        parts.append(r" \\ ".join(rf"{lbl}:~~{_href(url)}" for lbl, url in links))
        parts.append(r"\vspace{2pt}")

    if content.skillGroups:
        parts.append(r"\section{Skills}")
        for g in content.skillGroups:
            if not g.skills:
                continue
            parts.append(rf"\subsection{{{esc(g.category)}}}")
            parts.append(BULLDOT.join(esc(s) for s in g.skills))
            parts.append(r"\vspace{4pt}")

    if content.experience:
        parts.append(r"\section{Experience}")
        for e in content.experience:
            title = e.company or e.role
            descript = e.role if (e.company and e.role) else ""
            parts.append(_modern_entry(title, descript, e.dateRange or e.location or "",
                                       e.bullets))

    return "\n".join(parts)


def _modern_right(content: ResumeContent) -> str:
    parts: List[str] = []

    if content.projects:
        parts.append(r"\section{Projects}")
        for p in content.projects:
            parts.append(_modern_entry(p.name, p.subtitle or "", "", p.bullets, link=p.link or ""))

    if content.certifications:
        parts.append(r"\section{Certifications}")
        rows = []
        for c in content.certifications:
            meta = ", ".join(x for x in (c.issuer, c.date) if x)
            rows.append(esc(c.name) + (rf" \loc{{({esc(meta)})}}" if meta else ""))
        parts.append(_ul(rows, env="tight", raw=True))
        parts.append(r"\vspace{4pt}")

    if content.achievements:
        parts.append(r"\section{Achievements}")
        parts.append(_ul(content.achievements, env="tight"))

    return "\n".join(parts)


def build_modern(contact: ContactInfo, content: ResumeContent) -> str:
    first, last = _split_name(contact.name)
    head_bits = []
    if contact.email:
        head_bits.append(rf"\href{{mailto:{esc_url(contact.email)}}}{{{esc(contact.email)}}}")
    if contact.phone:
        head_bits.append(esc(contact.phone))
    if contact.location:
        head_bits.append(esc(contact.location))
    contact_line = BULLDOT.join(head_bits)

    name_tex = rf"{{\color{{primary}} {esc(first)}}}"
    if last:
        name_tex += rf" {{\bfseries\color{{accent}} {esc(last)}}}"

    body = [
        _MODERN_PREAMBLE,
        r"\begin{document}",
        # name header
        r"\begin{center}",
        rf"{{\fontsize{{32}}{{36}}\selectfont {name_tex}}}\\[3pt]",
        rf"{{\small\color{{subheadings}} {contact_line}}}",
        r"\end{center}",
        r"\vspace{2pt}\textcolor{accent}{\rule{\textwidth}{1.2pt}}\vspace{8pt}",
        # Two columns via paracol (NOT minipage): paracol breaks each column across
        # pages independently, so a long profile flows onto page 2+ instead of being
        # shoved off the bottom of an unbreakable box (which left page 1 blank).
        r"\columnratio{0.33}",
        r"\setlength{\columnsep}{0.04\textwidth}",
        r"\begin{paracol}{2}",
        _modern_left(contact, content),
        r"\switchcolumn",
        _modern_right(content),
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
