"""Resume generator service — the public callable for this feature.

Runs the full graph (fetch profile -> LLM content -> assemble .tex -> compile) and
returns the raw LaTeX plus the compiled PDF (base64). This is the only entry point the
HTTP layer touches. The service writes nothing to any database — it is stateless, like
the rest of the AI pipeline.
"""

import base64

from app.features.resume_generator.graph import resume_graph
from app.features.resume_generator.schemas import (
    GenerateResumeInput,
    GenerateResumeResult,
)


async def generate_resume(data: GenerateResumeInput) -> GenerateResumeResult:
    final_state = await resume_graph.ainvoke({"data": data})

    pdf_bytes: bytes = final_state["pdf"]
    return GenerateResumeResult(
        talentId=data.talentId,
        template=data.template,
        tailored=bool(data.jobDescription and data.jobDescription.strip()),
        tex=final_state["tex"],
        pdfBase64=base64.b64encode(pdf_bytes).decode("ascii"),
    )
