"""Local harness to verify the parser step without a server.

Usage:
    AI/venv/Scripts/python.exe scripts/run_parser.py <resume_pdf_url> [appId] [studentId] [jobId]
"""

import asyncio
import json
import sys
from pathlib import Path

# Make the AI/ package importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.features.parser import ParseInput, parse_resume  # noqa: E402


async def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python scripts/run_parser.py <resume_pdf_url> "
            "[applicationId] [studentId] [jobId]"
        )
        raise SystemExit(1)

    data = ParseInput(
        resumeUrl=sys.argv[1],
        applicationId=sys.argv[2] if len(sys.argv) > 2 else "test-app",
        studentId=sys.argv[3] if len(sys.argv) > 3 else "test-student",
        jobId=sys.argv[4] if len(sys.argv) > 4 else "test-job",
    )

    result = await parse_resume(data)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
