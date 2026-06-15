"""Shortlist service — the public callable for this pipeline step.

Pure compute: no HTTP, no DB. Given a parsed resume and the job to match against,
returns the UNDER_REVIEW/SHORTLISTED decision plus a match score and reasons. Only
ever invoked for resumes that passed fake detection — the orchestrator handles fakes.
"""

from app.features.shortlist.graph import shortlist_graph
from app.features.shortlist.schemas import ShortlistDecision, ShortlistInput


async def decide_shortlist(data: ShortlistInput) -> ShortlistDecision:
    final_state = await shortlist_graph.ainvoke(
        {
            "resume_json": data.resume.model_dump(),
            "job": data.job,
            "application_context": data.application_context,
        }
    )
    return final_state["result"]
