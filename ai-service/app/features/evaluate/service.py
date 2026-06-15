"""Evaluate service — orchestrates the full pipeline for one application.

Wires the existing steps into the flow triggered on application submit:

    parse_resume  ->  (is_fake?)  ->  REJECTED            (short-circuit, no LLM)
                                  ->  decide_shortlist  ->  UNDER_REVIEW | SHORTLISTED

A fake resume is rejected outright and never reaches the shortlist LLM. The result
is returned to core-service, which persists status, match score, reasons, and the
parsed resume. This service writes nothing to any database.
"""

from app.features.evaluate.schemas import EvaluateInput, EvaluateResult
from app.features.parser import ParseInput, parse_resume
from app.features.parser.schemas import ResumeData
from app.features.shortlist import ShortlistInput, decide_shortlist


async def evaluate_application(data: EvaluateInput) -> EvaluateResult:
    parsed = await parse_resume(
        ParseInput(
            resumeUrl=data.resumeUrl,
            applicationId=data.applicationId,
            studentId=data.studentId,
            jobId=data.jobId,
        )
    )
    resume = ResumeData(**parsed["json"])

    if parsed["is_fake"]:
        # Fake resumes are rejected outright — the shortlist LLM is never called.
        decision = "REJECTED"
        match_score = 0.0
        reasons = parsed["fake_reasons"] or ["Resume flagged as fake or not a genuine resume."]
    else:
        verdict = await decide_shortlist(ShortlistInput(resume=resume, job=data.job))
        decision = verdict.decision
        match_score = verdict.match_score
        reasons = verdict.reasons

    return EvaluateResult(
        applicationId=data.applicationId,
        studentId=data.studentId,
        jobId=data.jobId,
        is_fake=parsed["is_fake"],
        fake_confidence=parsed["fake_confidence"],
        fake_reasons=parsed["fake_reasons"],
        decision=decision,
        matchScore=match_score,
        reasons=reasons,
        resume=resume,
    )
