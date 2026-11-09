# Target Job Description Context & Replacement

Implement a UI dialog box in the React frontend (`web-ui`) to allow users to paste a target Job Description as plain text. The pasted job description is transmitted to the `job-app-agent` backend and injected into the LLM context window (`{active_job_description_context?}`). Any subsequent job description pasted immediately replaces the previous one in the agent's context memory.

## Architecture & Data Flow

```
[User Pastes Job Description in Modal] 
                 │
                 ▼
[Frontend: POST /apps/app/users/{userId}/sessions/{sessionId}/job-description]
                 │
                 ▼
 [Backend updates session.state["active_job_description_context"]]
                 │ (Replaces previous job description text)
                 ▼
 [ADK injects latest Job Description into LLM prompt]
```

---

## User Review Required

> [!IMPORTANT]
> - **Context Replacement**: Updating `session.state["active_job_description_context"]` overwrites previous job descriptions in the session state. Submitting a new job description immediately removes the old one from the model's context window.
> - **UI Accessibility**: Added a "Target Job" button in the header bar which triggers an embedded modal dialog containing a text area, character count, and save/clear actions.

---

## Proposed Changes

### Backend (`job-app-agent`)

#### [MODIFY] [fast_api_app.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/fast_api_app.py)
- Add `POST /apps/{app_name}/users/{user_id}/sessions/{session_id}/job-description` route:
  - Accepts JSON payload `{ "job_description": "...", "job_title": "..." }`.
  - Overwrites `session.state["active_job_description_context"]` and `session.state["job_description_text"]`.
  - Returns `{ "status": "success", "char_count": char_count }`.

#### [MODIFY] [agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py)
- Update `build_unified_skills_instruction()` return template to include `{active_job_description_context?}`.

---

### Frontend (`web-ui`)

#### [MODIFY] [src/services/api.js](file:///home/robert/work/agents/projects/job-app/web-ui/src/services/api.js)
- Add `setJobDescription({ userId, sessionId, jobDescription, jobTitle })` API service function.

#### [NEW] [src/components/JobDescriptionModal.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/JobDescriptionModal.jsx)
- Dialog component with a text area for pasting job descriptions.
- Includes action buttons ("Save Job Description", "Clear Job Description", "Cancel").

#### [MODIFY] [src/components/Header.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/Header.jsx)
- Add "Target Job" modal trigger button and active job description status badge.

#### [MODIFY] [src/App.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/App.jsx)
- Manage `activeJobDescription` state and trigger agent confirmation feedback when job descriptions are updated/replaced.

---

## Verification Plan

### Automated Tests
1. Unit and integration tests for job description endpoint and session state replacement:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/test_job_description_replacement.py
   ```
2. Full e2e test suite execution:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/
   ```

### Manual Verification
1. Open `http://localhost:5173` in browser.
2. Click "Target Job" in the header to open the dialog.
3. Paste Job Description 1 ("Senior Frontend Engineer at Google requiring 5+ years React"). Save and verify context confirmation message.
4. Paste Job Description 2 ("Mobile Developer at Apple requiring 4+ years Swift/iOS"). Save.
5. Ask the agent "What role and company am I applying for?". Verify the agent responds with Apple/Swift and no longer mentions Google/React.
