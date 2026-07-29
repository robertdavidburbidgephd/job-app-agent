"""Context and Skill management utilities for job-app-agent.

Provides persistent context management and skill loading hooks for job-application Q&A
and cover letter generation.
"""

from typing import Any
from google.adk.agents.context import Context


def get_user_profile(ctx: Context | None = None) -> dict[str, Any]:
    """Retrieve persistent user profile details.
    
    Checks ADK context state first (`ctx.state["user_profile"]`).
    Falls back to user-provided context structure.
    """
    if ctx and ctx.state and "user_profile" in ctx.state:
        return ctx.state["user_profile"]
    
    # Placeholder structure ready for persistent context updates from the user
    return {
        "full_name": "[User Name Not Specified]",
        "summary": "[User Background Summary Not Specified]",
        "skills": [],
        "experience": [],
        "education": [],
    }


def get_agent_skills(ctx: Context | None = None) -> list[dict[str, Any]]:
    """Retrieve registered job application skills.
    
    Checks ADK context state first (`ctx.state["user_skills"]`).
    Falls back to user-provided skills list.
    """
    if ctx and ctx.state and "user_skills" in ctx.state:
        return ctx.state["user_skills"]
    
    # Placeholder structure for specific agent skills provided by user
    return []


def format_context_prompt_header(ctx: Context | None = None) -> str:
    """Format user context and skills into a system instruction header."""
    profile = get_user_profile(ctx)
    skills = get_agent_skills(ctx)
    
    skills_str = ", ".join([s.get("name", str(s)) for s in skills]) if skills else "None provided yet"
    
    return (
        f"--- USER PERSISTENT CONTEXT ---\n"
        f"Name: {profile.get('full_name')}\n"
        f"Summary: {profile.get('summary')}\n"
        f"Registered Skills: {skills_str}\n"
        f"-------------------------------\n"
    )
