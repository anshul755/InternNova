"""LangGraph pipeline for the shortlist step: decide.

A single `decide` node today, built the same way as the parser graph so a future
`match-score` refinement or extra checks become additional nodes/edges here.
"""

import json
from typing import TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from app.core.llm import get_llm
from app.features.shortlist.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.features.shortlist.schemas import ApplicationContext, JobContext, ShortlistDecision


class ShortlistState(TypedDict, total=False):
    resume_json: dict
    job: JobContext
    application_context: ApplicationContext | None
    result: ShortlistDecision


async def _decide(state: ShortlistState) -> dict:
    llm = get_llm().with_structured_output(ShortlistDecision)
    job_text = json.dumps(state["job"].model_dump(), ensure_ascii=False, indent=2)
    application_context = state.get("application_context")
    application_context_text = json.dumps(
        application_context.model_dump() if application_context else {},
        ensure_ascii=False,
        indent=2,
    )
    resume_text = json.dumps(state["resume_json"], ensure_ascii=False, indent=2)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=USER_PROMPT_TEMPLATE.format(
                job=job_text,
                application_context=application_context_text,
                resume=resume_text,
            )
        ),
    ]
    result = await llm.ainvoke(messages)
    return {"result": result}


def build_shortlist_graph():
    graph = StateGraph(ShortlistState)
    graph.add_node("decide", _decide)

    graph.set_entry_point("decide")
    graph.add_edge("decide", END)

    return graph.compile()


# Compiled once at import; reused across invocations.
shortlist_graph = build_shortlist_graph()
