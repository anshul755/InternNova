"""LaTeX escaping and validation helpers.

The "Escape LaTeX Special Characters" step of the flowchart. Every piece of LLM/
profile text is passed through `esc()` before it lands in the template, so a stray
`&`, `%`, `_`, `#`, or `$` in someone's name or bullet point can't break the compile.
"""

# Typographic Unicode the LLM commonly emits that default pdflatex (inputenc utf8)
# cannot compile — normalised to plain ASCII equivalents BEFORE escaping. Accented
# letters (José, Müller, …) are intentionally left alone; inputenc handles those.
_NORMALIZE = {
    "‐": "-", "‑": "-", "‒": "-", "–": "--", "—": "---",
    "―": "---", "−": "-",  # hyphens / dashes / minus
    "‘": "'", "’": "'", "‚": "'", "‛": "'",  # single quotes
    "“": "''", "”": "''", "„": "''",  # double quotes
    "…": "...",  # ellipsis
    "•": "-", "‣": "-", "●": "-", "·": "-", "⁃": "-",  # bullets
    " ": " ", " ": " ", " ": " ", "​": "",  # spaces
    "→": "->", "⇒": "=>", "←": "<-",  # arrows
    "™": "(TM)", "®": "(R)", "©": "(C)",  # symbols
}


def _normalize(s: str) -> str:
    return "".join(_NORMALIZE.get(ch, ch) for ch in s)


# Each special char maps to its safe LaTeX form. Done char-by-char (below) so the
# backslash replacement can't re-trigger on backslashes it just introduced.
_SPECIAL = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}


def esc(value: object) -> str:
    """Escape arbitrary text for safe insertion into a LaTeX document body."""
    if value is None:
        return ""
    return "".join(_SPECIAL.get(ch, ch) for ch in _normalize(str(value)))


def esc_url(url: object) -> str:
    """Escape a URL for the first argument of \\href{...}{...}.

    hyperref handles most of a URL verbatim, but `%`, `#`, and `&` must be escaped or
    they terminate/break the argument. A missing scheme gets `https://` prepended so
    the link is clickable.
    """
    if not url:
        return ""
    text = str(url).strip()
    if text and "://" not in text and not text.startswith("mailto:"):
        text = "https://" + text
    for ch, rep in (("%", r"\%"), ("#", r"\#"), ("&", r"\&")):
        text = text.replace(ch, rep)
    return text


class ValidationError(Exception):
    """Raised when assembled .tex fails a basic structural sanity check."""


def validate_tex(tex: str) -> None:
    """Cheap pre-flight check so obvious assembly bugs fail before the network call."""
    if not tex or not tex.strip():
        raise ValidationError("Assembled .tex is empty")
    for marker in (r"\documentclass", r"\begin{document}", r"\end{document}"):
        if marker not in tex:
            raise ValidationError(f"Assembled .tex is missing {marker!r}")
    # Brace balance is the most common assembly bug; count unescaped braces.
    opens = _count_unescaped(tex, "{")
    closes = _count_unescaped(tex, "}")
    if opens != closes:
        raise ValidationError(
            f"Unbalanced braces in assembled .tex ({opens} '{{' vs {closes} '}}')"
        )


def _count_unescaped(tex: str, brace: str) -> int:
    count = 0
    i = 0
    n = len(tex)
    while i < n:
        ch = tex[i]
        if ch == "\\":  # skip the escaped char that follows a backslash
            i += 2
            continue
        if ch == brace:
            count += 1
        i += 1
    return count
