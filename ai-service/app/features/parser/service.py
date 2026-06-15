"""Parser service — the public callable for this pipeline step.

Pure compute: no HTTP, no DB. A later orchestrating endpoint awaits this as one
step of the full graph. Returns the two keys the flowchart calls for — `is_fake`
and `json` — alongside the IDs and the fake-detection detail.
"""

from app.features.parser.graph import parser_graph
from app.features.parser.schemas import ParseInput, ParsedResume


async def parse_resume(data: ParseInput) -> dict:
    final_state = await parser_graph.ainvoke({"resume_url": data.resumeUrl})
    result: ParsedResume = final_state["result"]

    return {
        "applicationId": data.applicationId,
        "studentId": data.studentId,
        "jobId": data.jobId,
        "is_fake": result.is_fake,
        "fake_confidence": result.fake_confidence,
        "fake_reasons": result.fake_reasons,
        "json": result.resume.model_dump(),
    }
