import pytest
from fastapi.testclient import TestClient
from app.fast_api_app import app
from app.app_utils import services

def test_job_description_update_and_replacement():
    client = TestClient(app)
    user_id = "test_user_jd"
    session_id = "test_session_jd"

    jd1 = "Senior Frontend Engineer at Google. Responsibilities include building scalable React web applications and TypeScript architecture."
    jd2 = "Mobile Tech Lead at Apple. Responsibilities include designing iOS apps using Swift and SwiftUI."

    # 1. Submit Job Description 1
    res1 = client.post(
        f"/apps/app/users/{user_id}/sessions/{session_id}/job-description",
        json={"job_title": "Senior Frontend Engineer - Google", "job_description": jd1}
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "success"
    assert data1["job_title"] == "Senior Frontend Engineer - Google"
    assert data1["char_count"] == len(jd1)

    # Verify session state context
    session_service = services.get_session_service()
    session1 = session_service.get_session_sync(app_name="app", user_id=user_id, session_id=session_id)
    assert session1 is not None
    assert "Google" in session1.state["active_job_description_context"]
    assert "React" in session1.state["active_job_description_context"]

    # 2. Submit Job Description 2 (subsequent submission should replace Job Description 1)
    res2 = client.post(
        f"/apps/app/users/{user_id}/sessions/{session_id}/job-description",
        json={"job_title": "Mobile Tech Lead - Apple", "job_description": jd2}
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "success"

    # Verify session state context replacement
    session2 = session_service.get_session_sync(app_name="app", user_id=user_id, session_id=session_id)
    assert session2 is not None
    assert "Apple" in session2.state["active_job_description_context"]
    assert "Swift" in session2.state["active_job_description_context"]

    # CRITICAL: Verify previous target job (Google/React) is REMOVED from context
    assert "Google" not in session2.state["active_job_description_context"]
    assert "React" not in session2.state["active_job_description_context"]

    print("\nJob Description endpoint and context replacement integration test PASSED!")

if __name__ == "__main__":
    test_job_description_update_and_replacement()
