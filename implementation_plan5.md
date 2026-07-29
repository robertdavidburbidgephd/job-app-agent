# PDF CV/Resume Upload & Context Replacement

Implement a PDF CV/Resume upload facility in the React frontend (`web-ui`) and integrate it into the `job-app-agent` backend. Uploaded PDF content is extracted, injected into the ADK session state context window (`{active_resume_context?}`), and automatically replaced whenever a subsequent CV/resume is uploaded.

## Architecture & Data Flow

```
[User Selects PDF] 
       │
       ▼
[Frontend: POST /apps/app/users/{userId}/sessions/{sessionId}/resume]
       │
       ▼
[Backend: pypdf extracts text] ──► [Updates session.state["active_resume_context"]]
                                                │ (Replaces previous CV text)
                                                ▼
                             [ADK injects latest CV into LLM prompt]
```

---

## User Review Required

> [!IMPORTANT]
> - **Context Window Replacement**: Updating `session.state["active_resume_context"]` on a session overwrites any previously uploaded resume text. This guarantees that subsequent uploads immediately replace older CVs in the context window.
> - **File Validation**: The backend restricts uploads to valid PDF documents (`.pdf` extension, MIME type `application/pdf`).

---

## Proposed Changes

### Backend (`job-app-agent`)

#### [MODIFY] [fast_api_app.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/fast_api_app.py)
- Add `POST /apps/{app_name}/users/{user_id}/sessions/{session_id}/resume` route:
  - Receives multipart `UploadFile`.
  - Parses text content using `pypdf.PdfReader`.
  - Overwrites `session.state["active_resume_context"]` and `session.state["resume_filename"]`.
  - Returns JSON `{ "status": "success", "filename": filename, "char_count": char_count }`.

#### [MODIFY] [agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py)
- Update system instruction template to include `{active_resume_context?}` so ADK automatically interpolates the active session's resume context into turns.

---

### Frontend (`web-ui`)

#### [MODIFY] [src/services/api.js](file:///home/robert/work/agents/projects/job-app/web-ui/src/services/api.js)
- Add `uploadResume({ userId, sessionId, file })` function sending multipart `FormData` to the resume upload endpoint.

#### [NEW] [src/components/ResumeUpload.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/ResumeUpload.jsx)
- File upload component supporting PDF file selection.
- Displays active CV badge (`📄 resume_v2.pdf`) with replacement status tooltips.

#### [MODIFY] [src/components/Header.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/Header.jsx)
- Integrate `ResumeUpload` into header bar.

#### [MODIFY] [src/App.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/App.jsx)
- Track active uploaded resume state (`activeResume`).
- Propagate upload status, error messages, and state resets.

---

## Verification Plan

### Automated Tests
1. Unit test PDF text extraction and session state overwrite logic:
   ```bash
   cd job-app-agent && uv run pytest tests/unit/
   ```
2. Integration test resume upload endpoint:
   ```bash
   cd job-app-agent && uv run pytest tests/integration/
   ```

### Manual Verification
1. Open `http://localhost:5173` in browser.
2. Upload a sample PDF resume (`resume_v1.pdf`).
3. Send a prompt ("What are my key skills based on my resume?").
4. Upload a second PDF resume (`resume_v2.pdf`).
5. Verify that the agent answers using the content from `resume_v2.pdf` and no longer references content unique to `resume_v1.pdf`.
