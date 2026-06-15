"""Local harness for the full evaluate step (parse -> shortlist) without a server.

Usage:
    ai-service/.venv/Scripts/python.exe scripts/run_evaluate.py <resume_pdf_url> <job_json_path> \
        [applicationId] [studentId] [jobId]

The job JSON file matches the `job` object of POST /pipeline/v1/evaluate — see
examples/sample_job.json.
"""

import asyncio
import json
import sys
from pathlib import Path

# Make the ai-service/ package importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.features.evaluate import EvaluateInput, evaluate_application  # noqa: E402
from app.features.shortlist import JobContext  # noqa: E402


async def main() -> None:
    if len(sys.argv) < 3:
        print(
            "Usage: python scripts/run_evaluate.py <resume_pdf_url> <job_json_path> "
            "[applicationId] [studentId] [jobId]"
        )
        raise SystemExit(1)

    job_data = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))

    data = EvaluateInput(
        resumeUrl=sys.argv[1],
        job=JobContext(**job_data),
        applicationId=sys.argv[3] if len(sys.argv) > 3 else "test-app",
        studentId=sys.argv[4] if len(sys.argv) > 4 else "test-student",
        jobId=sys.argv[5] if len(sys.argv) > 5 else "test-job",
    )

    result = await evaluate_application(data)
    print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
