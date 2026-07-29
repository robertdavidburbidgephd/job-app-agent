# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import glob
import os
from typing import Any

import yaml
from dotenv import load_dotenv
from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools.skill_toolset import models
from google.genai import types

from app.context_utils import format_context_prompt_header

load_dotenv()

MODEL = "gemini-3.6-flash"

gemini_model = Gemini(
    model=MODEL,
    retry_options=types.HttpRetryOptions(attempts=3),
)


def load_agent_skills() -> list[models.Skill]:
    """Dynamically discover and load SKILL.md files from the skills directory."""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skills_dir = os.path.join(project_root, "skills")
    skill_files = glob.glob(os.path.join(skills_dir, "*", "SKILL.md"))

    loaded_skills: list[models.Skill] = []
    for file_path in sorted(skill_files):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            if content.startswith("---"):
                parts = content.split("---", 2)
                fm_data = yaml.safe_load(parts[1]) if len(parts) > 1 else {}
                body = parts[2].strip() if len(parts) > 2 else ""
            else:
                fm_data = {
                    "name": os.path.basename(os.path.dirname(file_path)),
                    "description": "Agent Skill",
                }
                body = content.strip()

            frontmatter = models.Frontmatter(**fm_data)
            skill = models.Skill(frontmatter=frontmatter, instructions=body)
            loaded_skills.append(skill)
        except Exception as e:
            print(f"Warning: Failed to load skill from {file_path}: {e}")

    return loaded_skills


def build_unified_skills_instruction() -> str:
    """Build unified system instructions from dynamically loaded SKILL.md files."""
    skills = load_agent_skills()
    skills_text_blocks = []

    for idx, skill in enumerate(skills, start=1):
        skills_text_blocks.append(
            f"{idx}. SKILL: {skill.name}\n"
            f"   Description: {skill.description}\n"
            f"   Instructions:\n{skill.instructions}\n"
        )

    skills_formatted = "\n".join(skills_text_blocks)

    return (
        f"{format_context_prompt_header()}\n"
        "{active_resume_context?}\n"
        "{active_job_description_context?}\n"
        "You are the unified Job Application & Career Assistant.\n"
        "You maintain a consistent conversation memory throughout all user turns to deliver a seamless user experience.\n\n"
        "You possess the following specialized skills loaded from the agent skills directory:\n\n"
        f"{skills_formatted}\n"
        "Always refer to persistent user profile context, active resume/CV context, target job description context, and prior turn context in conversation memory when available."
    )


# System Instruction derived from dynamic SKILL.md files
UNIFIED_AGENT_INSTRUCTION = build_unified_skills_instruction()

# Single Unified Agent Node
root_agent = LlmAgent(
    name="job_app_agent",
    model=gemini_model,
    instruction=UNIFIED_AGENT_INSTRUCTION,
    description="Unified Job Application Assistant with skills loaded dynamically from SKILL.md files.",
)

# ADK Application Instance
app = App(
    root_agent=root_agent,
    name="app",
)
