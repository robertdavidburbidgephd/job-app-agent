# PDF CV/Resume Upload & Context Replacement Walkthrough

Added a PDF CV/Resume upload facility to the React web UI ([web-ui](file:///home/robert/work/agents/projects/job-app/web-ui)) and FastAPI backend ([fast_api_app.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/fast_api_app.py)). Uploaded PDF text is extracted and injected into the ADK context window (`{active_resume_context?}`). Any subsequent upload automatically overwrites and replaces the previous resume text in the session state context.

## Completed Changes

### 1. Backend PDF Parsing & Context Route ([fast_api_app.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/fast_api_app.py))
- Added `POST /apps/{app_name}/users/{user_id}/sessions/{session_id}/resume`:
  - Validates file type (`.pdf`).
  - Extracts text using `pypdf.PdfReader`.
  - Overwrites `session.state["active_resume_context"]` and `session.state["resume_filename"]`.
  - Guarantees that uploading a new PDF replaces the previous CV text in the session context window.

### 2. Instruction Template Interpolation ([agent.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/app/agent.py))
- Added `{active_resume_context?}` placeholder to `build_unified_skills_instruction()`, enabling ADK to automatically interpolate the active session's resume context into turns when present.

### 3. Frontend Web UI Components ([web-ui/src/](file:///home/robert/work/agents/projects/job-app/web-ui/src))
- **[ResumeUpload.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/ResumeUpload.jsx)**: Upload button with PDF file picker, active resume badge (`📄 resume.pdf`), and replacement status tooltips.
- **[Header.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/Header.jsx)**: Integrated `ResumeUpload` into top navigation.
- **[api.js](file:///home/robert/work/agents/projects/job-app/web-ui/src/services/api.js)**: Added `uploadResume` helper posting `FormData` to the backend.
- **[App.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/App.jsx)**: Manages active resume state and displays system confirmation messages upon uploading.

---

## Visual Verification & Testing

### 1. Web UI Header with "Upload CV (PDF)" Button
![Web UI Header with Resume Upload](file:///home/robert/.gemini/antigravity-ide/brain/1ca2f88d-7efe-44f1-ad12-19dee16a37c5/initial_page_load_1784909146060.png)

### 2. Context Replacement Integration Test
Automated integration test ([test_pdf_context_replacement.py](file:///home/robert/work/agents/projects/job-app/job-app-agent/tests/integration/test_pdf_context_replacement.py)):
- **Step 1**: Uploaded `alice_vance_cv.pdf`. Confirmed `"Alice Vance"` present in `session.state["active_resume_context"]`.
- **Step 2**: Uploaded `bob_marley_cv.pdf`. Confirmed `"Bob Marley"` present and `"Alice Vance"` **completely removed** from `session.state["active_resume_context"]`.
- **Status**: `PASSED`
