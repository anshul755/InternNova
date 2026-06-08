"""Local harness for the resume generator without the HTTP server.

Two modes:

  # Full pipeline (needs core-service running + a real talentId):
  AI/venv/Scripts/python.exe scripts/run_resume.py --talent <talentId> \
      --template modern --email me@example.com [--jd path/to/jd.txt]

  # Offline mode (no core-service): feed a profile JSON matching the
  # /talent/v1/profile/{id}/full shape (see examples/sample_profile.json):
  AI/venv/Scripts/python.exe scripts/run_resume.py --profile examples/sample_profile.json \
      --template classic --email me@example.com

Writes the assembled .tex and compiled .pdf to AI/scripts/out/ for inspection.
"""

import argparse
import asyncio
import base64
import json
import sys
from pathlib import Path

# Make the AI/ package importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.features.resume_generator.graph import (  # noqa: E402
    _assemble_tex,
    _compile,
    _write_content,
)
from app.features.resume_generator.schemas import (  # noqa: E402
    ContactInfo,
    GenerateResumeInput,
    TalentProfile,
    TemplateStyle,
)
from app.features.resume_generator.service import generate_resume  # noqa: E402

OUT_DIR = Path(__file__).parent / "out"


def _save(name: str, tex: str, pdf: bytes) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{name}.tex").write_text(tex, encoding="utf-8")
    (OUT_DIR / f"{name}.pdf").write_bytes(pdf)
    print(f"  -> {OUT_DIR / (name + '.tex')}  ({len(tex)} chars)")
    print(f"  -> {OUT_DIR / (name + '.pdf')}  ({len(pdf)} bytes)")


async def run_full(args) -> None:
    jd = Path(args.jd).read_text(encoding="utf-8") if args.jd else None
    data = GenerateResumeInput(
        talentId=args.talent,
        template=TemplateStyle(args.template),
        email=args.email,
        phone=args.phone,
        jobTitle=args.job_title,
        jobDescription=jd,
    )
    result = await generate_resume(data)
    pdf = base64.b64decode(result.pdfBase64)
    print(f"template={result.template.value} tailored={result.tailored}")
    _save(f"{args.talent}_{result.template.value}", result.tex, pdf)


async def run_offline(args) -> None:
    profile = TalentProfile.model_validate(
        json.loads(Path(args.profile).read_text(encoding="utf-8"))
    )
    jd = Path(args.jd).read_text(encoding="utf-8") if args.jd else None
    data = GenerateResumeInput(
        talentId=profile.id or "offline",
        template=TemplateStyle(args.template),
        email=args.email,
        phone=args.phone,
        jobTitle=args.job_title,
        jobDescription=jd,
    )
    contact = ContactInfo(
        name=profile.name or "Candidate",
        email=data.email,
        phone=data.phone,
        location=profile.location,
        linkedin=profile.linkedinUrl,
        github=profile.githubUrl,
        portfolio=profile.portfolioUrl,
    )
    # Run the LLM + assemble + compile nodes directly, skipping the core fetch.
    state = {"data": data, "profile": profile, "contact": contact}
    state.update(await _write_content(state))
    state.update(_assemble_tex(state))
    state.update(await _compile(state))
    print(f"template={data.template.value} tailored={bool(jd)}")
    _save(f"{data.talentId}_{data.template.value}", state["tex"], state["pdf"])


def main() -> None:
    p = argparse.ArgumentParser(description="Generate a resume PDF locally.")
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--talent", help="talentId (full pipeline; needs core-service)")
    src.add_argument("--profile", help="path to a profile JSON (offline; skips core fetch)")
    p.add_argument("--template", default="classic", choices=[t.value for t in TemplateStyle])
    p.add_argument("--email")
    p.add_argument("--phone")
    p.add_argument("--job-title")
    p.add_argument("--jd", help="path to a job-description text file (enables tailoring)")
    args = p.parse_args()

    if args.talent:
        asyncio.run(run_full(args))
    else:
        asyncio.run(run_offline(args))


if __name__ == "__main__":
    main()
