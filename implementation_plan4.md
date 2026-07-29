# Separate Skills into `SKILL.md` Files using Antigravity Agent Skills Framework

Extract the three embedded skills from `UNIFIED_AGENT_INSTRUCTION` in `app/agent.py` into modular, standalone `SKILL.md` files residing in `job-app-agent/skills/`. Refactor `app/agent.py` to dynamically load these skills using the ADK / Antigravity Agent Skills Framework.

## Proposed Directory & File Layout

```
job-app-agent/
└── skills/
    ├── job-qa-interview-prep/
    │   └── SKILL.md
    ├── cover-letter-writing/
    │   └── SKILL.md
    └── general-career-assistance/
        └── SKILL.md
```

---

## Proposed Changes

### 1. Skill Files Creation (`skills/`)

#### [NEW] [SKILL.md](file:///home/robert/work/agents/projects/job-app/job-app-agent/skills/job-qa-interview-prep/SKILL.md)
- **name**: `job-qa-interview-prep`
- **description**: Help jobseekers answer specific job-application, interview, resume, and career questions.
- **body**: Guidelines for STAR-formatted interview prep, resume review, and behavioral questions.

#### [NEW] [SKILL.md](file:///home/robert/work/agents/projects/job-app/job-app-agent/skills/cover-letter-writing/SKILL.md)
- **name**: `cover-letter-writing`
- **description**: Draft compelling, professional, and well-tailored cover letters for specific job applications.
- **body**: Guidelines for cover letter structure (salutation, opening hook, key achievements, company alignment, call to action) and prior context usage.

#### [NEW] [SKILL.md](file:///home/robert/work/agents/projects/job-app/job-app-agent/skills/general-career-assistance/SKILL.md)
- **name**: `general-career-assistance`
- **description**: Answer general career queries helpfully, accurately, and concisely while maintaining context from preceding turns.
- **body**: Guidelines for general career Q&A and multi-turn conversation continuity.

---

### 2. Agent Core Refactoring (`app/agent.py`)

#### [MODIFY] [agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py)
- Replace static `UNIFIED_AGENT_INSTRUCTION` string with a skill loader module that loads `Skill` models from `skills/*/SKILL.md`.
- Register loaded skills with ADK `SkillToolset` or construct unified instructions dynamically from registered `SKILL.md` contents.
- Keep `root_agent` as the single `LlmAgent` and `app` as `App(root_agent=root_agent, name="app")`.

---

## Verification Plan

### Automated Tests
1. Run skill loading verification script:
   - Ensure all `SKILL.md` files parse with valid YAML frontmatter and `Skill` schemas without errors.
2. Run integration test suite:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/test_agent.py
   ```
3. Run e2e test suite:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/test_server_e2e.py
   ```

### Manual Verification
1. Verify `SKILL.md` files exist and follow the Agent Skills Specification (YAML frontmatter + Markdown body).
2. Start server and run multi-turn conversation test to confirm agent loads skill instructions cleanly and retains conversation memory.
