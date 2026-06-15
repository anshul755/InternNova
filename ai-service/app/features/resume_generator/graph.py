"""LangGraph pipeline for the resume generator.

Implements the flowchart as four nodes:

    fetch_profile -> write_content -> assemble_tex -> compile

Each node maps to one box in the design: pull the talent's full profile from
core-service, have the LLM write grounded structured content, assemble + escape +
validate the .tex, then compile it to a PDF via LaTeX.Online.
"""

import json
from typing import Optional, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from app.core.llm import get_llm
from app.features.resume_generator.compiler import compile_tex
from app.features.resume_generator.latex import validate_tex
from app.features.resume_generator.profile_client import fetch_talent_profile
from app.features.resume_generator.prompts import (
    CLASSIC_DIRECTIVE,
    JOB_BLOCK_TEMPLATE,
    MODERN_DIRECTIVE,
    SYSTEM_PROMPT,
    USER_PROMPT_TEMPLATE,
)
from app.features.resume_generator.schemas import (
    ContactInfo,
    GenerateResumeInput,
    ResumeContent,
    TalentProfile,
    TemplateStyle,
)
from app.features.resume_generator.templates import render_template


class ResumeState(TypedDict, total=False):
    data: GenerateResumeInput
    profile: TalentProfile
    contact: ContactInfo
    content: ResumeContent
    tex: str
    pdf: bytes


async def _fetch_profile(state: ResumeState) -> dict:
    data = state["data"]
    profile = await fetch_talent_profile(data.talentId)
    # Contact is assembled here, from facts only — never from the LLM.
    contact = ContactInfo(
        name=profile.name or "Candidate",
        email=data.email,
        phone=data.phone,
        location=profile.location,
        linkedin=profile.linkedinUrl,
        github=profile.githubUrl,
        portfolio=profile.portfolioUrl,
    )
    return {"profile": profile, "contact": contact}


async def _write_content(state: ResumeState) -> dict:
    data = state["data"]
    profile = state["profile"]

    profile_json = json.dumps(profile.model_dump(exclude_none=True), ensure_ascii=False, indent=2)
    user = USER_PROMPT_TEMPLATE.format(profile=profile_json)
    if data.jobDescription and data.jobDescription.strip():
        user += JOB_BLOCK_TEMPLATE.format(
            title=data.jobTitle or "(unspecified)", description=data.jobDescription
        )
    elif data.jobTitle and data.jobTitle.strip():
        user += JOB_BLOCK_TEMPLATE.format(
            title=data.jobTitle.strip(),
            description="(No description provided — tailor using the title alone: emphasise skills and experience relevant to this role.)",
        )

    # Template directive comes LAST so it has the final word on length: modern has a
    # hard one-page limit, classic (ATS) may run longer.
    user += (
        MODERN_DIRECTIVE if data.template == TemplateStyle.modern else CLASSIC_DIRECTIVE
    )

    # json_schema (Groq native structured outputs) rather than the default tool-calling:
    # gpt-oss models intermittently emit a renamed tool that Groq's validator rejects.
    llm = get_llm().with_structured_output(ResumeContent, method="json_schema")
    content = await llm.ainvoke(
        [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=user)]
    )
    return {"content": content}


def _assemble_tex(state: ResumeState) -> dict:
    data = state["data"]
    tex = render_template(data.template, state["contact"], state["content"])
    validate_tex(tex)  # cheap structural check before the network compile
    return {"tex": tex}


async def _compile(state: ResumeState) -> dict:
    pdf = await compile_tex(state["tex"])
    return {"pdf": pdf}


def build_resume_graph():
    graph = StateGraph(ResumeState)
    graph.add_node("fetch_profile", _fetch_profile)
    graph.add_node("write_content", _write_content)
    graph.add_node("assemble_tex", _assemble_tex)
    graph.add_node("compile", _compile)

    graph.set_entry_point("fetch_profile")
    graph.add_edge("fetch_profile", "write_content")
    graph.add_edge("write_content", "assemble_tex")
    graph.add_edge("assemble_tex", "compile")
    graph.add_edge("compile", END)

    return graph.compile()


# Compiled once at import; reused across invocations.
resume_graph = build_resume_graph()
