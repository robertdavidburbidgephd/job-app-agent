# Implementation Plan - ADK 2.0 Graph Workflow: `job-app-agent`

Create a new graph workflow agent project using **ADK 2.0** (`google.adk.workflow.Workflow`) named **`job-app-agent`** designed as a job application assistant for jobseekers. The project will be prepared for deployment so that it can be queried from a web browser (e.g. Firefox on an Android phone).

---

## User Review Required

> [!IMPORTANT]
> **Deployment Target & Architecture Choice**
> - **Initial Phase**: We will scaffold `job-app-agent` using `agents-cli scaffold create job-app-agent --agent adk --prototype --agent-guidance-filename GEMINI.md`.
> - **Web/Mobile Access**: The scaffolded ADK project provides a FastAPI app surface (`app/fast_api_app.py`) and a Docker container setup (`Dockerfile`), exposing REST/A2A endpoints and interactive endpoints accessible from any browser (including mobile Firefox on Android).
> - **Deployment Target Options**: When you are ready to deploy to production, we can enhance the project with `agents-cli scaffold enhance . --deployment-target <agent_runtime|cloud_run|gke>`. Cloud Run or Agent Runtime (Vertex AI) are recommended for web/mobile accessibility.

---

## Open Questions

> [!NOTE]
> 1. **Persistent Context Format**: For the persistent user context and skills you will provide later, would you prefer storing them in local JSON/YAML context files, environment variables, or dynamic ADK session state keys (e.g., `ctx.state["user_profile"]`)?
> 2. **Model Preference**: We will use Gemini (`gemini-2.5-flash` / `gemini-flash-latest`) for classification and agent nodes. Let us know if you have a specific model version requirement.

---

## Proposed Changes

We will create the project directory `job-app-agent` using `agents-cli scaffold create` (without pre-creating the directory as mandated by CLI guidelines).

### [Scaffolding]

#### [NEW] [job-app-agent/](file:///home/robert/work/agents/projects/job-app/job-app-agent)
Run CLI command:
```bash
agents-cli scaffold create job-app-agent \
  --agent adk \
  --prototype \
  --agent-guidance-filename GEMINI.md \
  --auto-approve
```

---

### [Job Application Assistant Workflow]

#### [NEW] [app/agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py)
Implement the ADK 2.0 `Workflow` graph with three main request handlers:

1. **Request Classifier Node (`classify_request`)**:
   - Accepts user message input.
   - Uses structured classification (`Pydantic` schema `JobRequestCategory` with values: `JOB_QA`, `COVER_LETTER`, `GENERIC`).
   - Returns an `Event(output=node_input, route=category)` to dynamically route to downstream branch nodes.

2. **Job Application Q&A Agent Node (`job_qa_agent`)**:
   - `LlmAgent` specialized in answering specific job application questions (e.g., work experience highlights, behavioral questions, salary expectations framing).
   - Designed with explicit context integration points for user-provided skills and profile details.

3. **Cover Letter Generator Agent Node (`cover_letter_agent`)**:
   - `LlmAgent` specialized in drafting tailored, professional cover letters for specific job applications.
   - Designed with explicit context integration points for job description details and user resume/skills context.

4. **Generic Assistant Agent Node (`generic_agent`)**:
   - `LlmAgent` fallback for any other general queries or non-job application requests.

5. **ADK 2.0 Workflow Construction**:
   - Graph defined via `Workflow(name="job_app_agent", edges=[...])`:
     - `('START', classify_request)`
     - `(classify_request, job_qa_agent, 'JOB_QA')`
     - `(classify_request, cover_letter_agent, 'COVER_LETTER')`
     - `(classify_request, generic_agent, '__DEFAULT__')`

#### [NEW] [app/context_utils.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/context_utils.py)
- Utility module providing helper hooks for loading user profile context, skills, and past application memory into `ctx.state`.
- Ready to be populated with your specific skills and persistent context.

---

## Verification Plan

### Automated Tests
- Run `uv sync` inside `job-app-agent/` to verify all ADK 2.0 dependencies resolve properly.
- Run `agents-cli run "How should I describe my leadership experience for a Senior Developer role?"` to test routing to `job_qa_agent`.
- Run `agents-cli run "Write a cover letter for a Software Engineer role at Google."` to test routing to `cover_letter_agent`.
- Run `agents-cli run "What is the capital of France?"` to test fallback routing to `generic_agent`.

### Manual Verification
- Test local FastAPI serving: run `uv run uvicorn app.fast_api_app:app --host 0.0.0.0 --port 8000`.
- Access the web interface / endpoint from local browser or mobile device on the network to verify responsiveness.
