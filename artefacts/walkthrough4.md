# Agent Skills Framework Extraction & Walkthrough

The integrated skills in `job-app-agent` have been extracted into individual `SKILL.md` files under `job-app-agent/skills/` following the Antigravity Agent Skills Framework specification. [agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py) now dynamically discovers and loads these skills.

## Created Skill Files

Each skill file is structured with YAML frontmatter for metadata discovery and markdown guidelines for instruction execution:

1. **[job-qa-interview-prep/SKILL.md](file:///home/robert/work/agents/projects/job-app/job-app-agent/skills/job-qa-interview-prep/SKILL.md)**:
   - **Skill Name**: `job-qa-interview-prep`
   - **Description**: Help jobseekers answer specific job-application, interview, resume, and career questions with structured, encouraging, and tailored advice.

2. **[cover-letter-writing/SKILL.md](file:///home/robert/work/agents/projects/job-app/job-app-agent/skills/cover-letter-writing/SKILL.md)**:
   - **Skill Name**: `cover-letter-writing`
   - **Description**: Draft compelling, professional, and well-tailored cover letters for specific job applications drawing context from prior discussion turns.

3. **[general-career-assistance/SKILL.md](file:///home/robert/work/agents/projects/job-app/job-app-agent/skills/general-career-assistance/SKILL.md)**:
   - **Skill Name**: `general-career-assistance`
   - **Description**: Answer general career queries helpfully, accurately, and concisely while retaining context from preceding turns in the conversation.

---

## Dynamic Skill Loader ([agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py))

- Implemented `load_agent_skills()`: Discovers all `skills/*/SKILL.md` paths, parses YAML frontmatter and markdown body using ADK `models.Frontmatter` and `models.Skill`.
- Implemented `build_unified_skills_instruction()`: Dynamically formats system instructions from registered skills alongside persistent user profile context.
- Instantiated `root_agent` (`LlmAgent`) using the dynamically constructed system instruction.

---

## Automated Test Results

- `tests/integration/test_agent.py`: `PASSED`
- `tests/integration/test_server_e2e.py`:
  - `test_adk_run_sse`: `PASSED`
  - `test_a2a_chat_stream`: `PASSED`
  - `test_agent_card`: `PASSED`
  - `test_collect_feedback`: `PASSED`
