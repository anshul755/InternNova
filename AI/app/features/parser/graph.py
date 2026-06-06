"""LangGraph pipeline for the parser step: fetch -> extract -> analyze.

This is intentionally where LangGraph enters the codebase. The later flowchart
nodes (VERIFY, Is-Shortlisted, match-score) become additional nodes/edges on a
graph built the same way.
"""

from typing import TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from app.core.llm import get_llm
from app.features.parser.extractor import download_pdf, extract_text
from app.features.parser.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.features.parser.schemas import ParsedResume


class ParserState(TypedDict, total=False):
    resume_url: str
    pdf_bytes: bytes
    text: str
    result: ParsedResume


async def _fetch_pdf(state: ParserState) -> dict:
    return {"pdf_bytes": await download_pdf(state["resume_url"])}


def _extract_text(state: ParserState) -> dict:
    return {"text": extract_text(state["pdf_bytes"])}


async def _analyze(state: ParserState) -> dict:
    llm = get_llm().with_structured_output(ParsedResume)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=USER_PROMPT_TEMPLATE.format(resume_text=state["text"])),
    ]
    result = await llm.ainvoke(messages)
    return {"result": result}


def build_parser_graph():
    graph = StateGraph(ParserState)
    graph.add_node("fetch_pdf", _fetch_pdf)
    graph.add_node("extract_text", _extract_text)
    graph.add_node("analyze", _analyze)

    graph.set_entry_point("fetch_pdf")
    graph.add_edge("fetch_pdf", "extract_text")
    graph.add_edge("extract_text", "analyze")
    graph.add_edge("analyze", END)

    return graph.compile()


# Compiled once at import; reused across invocations.
parser_graph = build_parser_graph()
