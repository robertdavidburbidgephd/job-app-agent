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

import contextlib
import io
import os
from collections.abc import AsyncIterator
from typing import Any

import google.auth
from a2a.server.tasks import InMemoryTaskStore
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.runners import Runner
from google.cloud import logging as google_cloud_logging
from pypdf import PdfReader

from app.app_utils import services
from app.app_utils.a2a import attach_a2a_routes
from app.app_utils.typing import Feedback, JobDescriptionPayload

load_dotenv()
_, project_id = google.auth.default()
logging_client = google_cloud_logging.Client()
logger = logging_client.logger(__name__)
allow_origins = (
    os.getenv("ALLOW_ORIGINS", "").split(",") if os.getenv("ALLOW_ORIGINS") else ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8000"]
)

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    from app.agent import app as adk_app
    from app.agent import root_agent

    runner = Runner(
        app=adk_app,
        session_service=services.get_session_service(),
        artifact_service=services.get_artifact_service(),
        auto_create_session=True,
    )
    app.state.runner = runner
    app.state.agent_app_name = adk_app.name
    await attach_a2a_routes(
        app,
        agent=root_agent,
        runner=runner,
        task_store=InMemoryTaskStore(),
        rpc_path=f"/a2a/{adk_app.name}",
    )

    # Mount static files for the React web-ui frontend (after all API & A2A routes)
    static_dir = os.path.join(AGENT_DIR, "static")
    if os.path.isdir(static_dir):
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

    yield


app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=False,
    artifact_service_uri=services.ARTIFACT_SERVICE_URI,
    allow_origins=allow_origins,
    session_service_uri=services.SESSION_SERVICE_URI,
    otel_to_cloud=True,
    lifespan=lifespan,
)
app.title = "job-app-agent"
app.description = "API for interacting with the Agent job-app-agent"


@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback.

    Args:
        feedback: The feedback data to log

    Returns:
        Success message
    """
    logger.log_struct(feedback.model_dump(), severity="INFO")
    return {"status": "success"}


@app.post("/apps/{app_name}/users/{user_id}/sessions/{session_id}/resume")
async def upload_resume(
    app_name: str,
    user_id: str,
    session_id: str,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Upload PDF CV/Resume and update the ADK session state.

    Subsequent uploads overwrite the previous resume text in session state,
    ensuring only the latest uploaded CV is retained in the LLM context.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are supported.")

    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")

    try:
        pdf_reader = PdfReader(io.BytesIO(content_bytes))
        extracted_text = "\n".join(
            [page.extract_text() or "" for page in pdf_reader.pages]
        ).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF file: {e}")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from PDF.")

    session_service = services.get_session_service()
    session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=session_id)

    formatted_context = (
        f"--- ACTIVE USER RESUME / CV ({file.filename}) ---\n"
        f"{extracted_text}\n"
        f"--------------------------------------------------\n"
    )

    if session is None:
        await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state={"resume_filename": file.filename, "active_resume_context": formatted_context},
        )
    else:
        if hasattr(session_service, "sessions") and app_name in session_service.sessions and user_id in session_service.sessions[app_name] and session_id in session_service.sessions[app_name][user_id]:
            session_obj = session_service.sessions[app_name][user_id][session_id]
            session_obj.state["resume_filename"] = file.filename
            session_obj.state["active_resume_context"] = formatted_context
        else:
            session.state["resume_filename"] = file.filename
            session.state["active_resume_context"] = formatted_context

    return {
        "status": "success",
        "filename": file.filename,
        "char_count": len(extracted_text),
        "message": f"Resume '{file.filename}' uploaded and active in agent context.",
    }


@app.post("/apps/{app_name}/users/{user_id}/sessions/{session_id}/job-description")
async def update_job_description(
    app_name: str,
    user_id: str,
    session_id: str,
    payload: JobDescriptionPayload,
) -> dict[str, Any]:
    """Update or replace target job description text in ADK session state context."""
    text = payload.job_description.strip() if payload.job_description else ""
    if not text:
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    title_label = f" ({payload.job_title})" if payload.job_title else ""
    formatted_context = (
        f"--- TARGET JOB DESCRIPTION{title_label} ---\n"
        f"{text}\n"
        f"--------------------------------------------------\n"
    )

    session_service = services.get_session_service()
    session = await session_service.get_session(app_name=app_name, user_id=user_id, session_id=session_id)

    if session is None:
        await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state={
                "job_description_text": text,
                "job_title": payload.job_title,
                "active_job_description_context": formatted_context,
            },
        )
    else:
        if hasattr(session_service, "sessions") and app_name in session_service.sessions and user_id in session_service.sessions[app_name] and session_id in session_service.sessions[app_name][user_id]:
            session_obj = session_service.sessions[app_name][user_id][session_id]
            session_obj.state["job_description_text"] = text
            session_obj.state["job_title"] = payload.job_title
            session_obj.state["active_job_description_context"] = formatted_context
        else:
            session.state["job_description_text"] = text
            session.state["job_title"] = payload.job_title
            session.state["active_job_description_context"] = formatted_context

    return {
        "status": "success",
        "job_title": payload.job_title,
        "char_count": len(text),
        "message": "Job description updated and active in agent context.",
    }


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
