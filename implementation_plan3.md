# Unify `job-app-agent` Architecture into Single Agent with Integrated Skills

Refactor `job-app-agent` from a multi-agent `Workflow` (which routes messages between 3 separate sub-agent nodes and resets/fragments node context) into a single, unified `LlmAgent`. The instructions of the previous sub-agents (`job_qa_agent`, `cover_letter_agent`, `generic_agent`) will be converted into modular skills integrated into the single agent's system instruction, preserving consistent conversation memory across all turns.

## Proposed Changes

### 1. Agent Core (`app/agent.py`)

#### [MODIFY] [agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py)
- Remove `Workflow`, `classify_request`, and the sub-agent definitions (`job_qa_agent`, `cover_letter_agent`, `generic_agent`).
- Define the unified system instructions incorporating the three skills:
  1. **Job Application Q&A & Interview Prep Skill**: Tailored interview advice, resume questions, career Q&A.
  2. **Cover Letter Writing Skill**: Drafting cover letters with opening hooks, achievements, company alignment, and call-to-action.
  3. **General Assistance Skill**: Handling general queries while retaining prior conversation context.
- Instantiate a single unified `LlmAgent` named `job_app_agent` with dynamic instruction resolving persistent user context via `format_context_prompt_header`.
- Export `root_agent = unified_agent` and `app = App(root_agent=root_agent, name="app")`.

---

### 2. Context & Tests Verification

#### [VERIFY] [context_utils.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/context_utils.py)
Verify that `format_context_prompt_header` integrates cleanly into the unified agent's instruction callback.

#### [VERIFY] [test_agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/tests/integration/test_agent.py) & [test_server_e2e.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/tests/integration/test_server_e2e.py)
Run integration and e2e server test suite (`pytest`) to confirm that all tests pass with the single unified agent.

---

## User Review Required

> [!IMPORTANT]
> - **Context Consistency**: Switching from graph `Workflow` to a single `LlmAgent` ensures that multi-turn chat history (such as asking a job Q&A question followed by requesting a cover letter for the same role) is retained in a single continuous session memory.
> - **Export Signatures**: `root_agent` and `app` remain exported from `app/agent.py`, preserving backwards compatibility with `fast_api_app.py` and test runners.

---

## Verification Plan

### Automated Tests
1. Run pytest suite:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/test_agent.py
   ```
2. Verify FastAPI server startup and e2e integration:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/test_server_e2e.py
   ```

### Manual Verification
1. Start backend server: `cd job-app-agent && uv run python -m app.fast_api_app`.
2. Perform multi-turn test in `web-ui` or via `curl`:
   - Turn 1: Ask an interview question about a Software Engineer position.
   - Turn 2: Follow up with "Draft a cover letter for this role".
   - Confirm the agent remembers the position and details from Turn 1 without context loss.
