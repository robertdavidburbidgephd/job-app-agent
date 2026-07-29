import io
import pytest
from reportlab.pdfgen import canvas
from fastapi.testclient import TestClient
from app.fast_api_app import app
from app.app_utils import services

def make_pdf(text: str) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, text)
    c.save()
    return buf.getvalue()

def test_pdf_resume_upload_and_context_replacement():
    client = TestClient(app)
    user_id = "test_user_replacement"
    session_id = "test_session_replacement"

    pdf1_bytes = make_pdf("Alice Vance - Senior Go Developer with 8 years of backend microservices experience.")
    pdf2_bytes = make_pdf("Bob Marley - Principal Mobile Engineer with 10 years of Flutter and iOS experience.")

    # 1. Upload CV 1
    res1 = client.post(
        f"/apps/app/users/{user_id}/sessions/{session_id}/resume",
        files={"file": ("alice_vance_cv.pdf", pdf1_bytes, "application/pdf")}
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "success"
    assert data1["filename"] == "alice_vance_cv.pdf"
    assert data1["char_count"] > 0

    # Retrieve session state
    session_service = services.get_session_service()
    session1 = session_service.get_session_sync(app_name="app", user_id=user_id, session_id=session_id)
    assert session1 is not None
    assert "Alice Vance" in session1.state["active_resume_context"]
    assert session1.state["resume_filename"] == "alice_vance_cv.pdf"

    # 2. Upload CV 2 (subsequent upload should replace CV 1)
    res2 = client.post(
        f"/apps/app/users/{user_id}/sessions/{session_id}/resume",
        files={"file": ("bob_marley_cv.pdf", pdf2_bytes, "application/pdf")}
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "success"
    assert data2["filename"] == "bob_marley_cv.pdf"

    # Verify session state context replacement
    session2 = session_service.get_session_sync(app_name="app", user_id=user_id, session_id=session_id)
    assert session2 is not None
    assert "Bob Marley" in session2.state["active_resume_context"]
    assert session2.state["resume_filename"] == "bob_marley_cv.pdf"
    # CRITICAL: Verify previous CV (Alice Vance) is REMOVED from context
    assert "Alice Vance" not in session2.state["active_resume_context"]

    print("\nPDF upload and context replacement integration test PASSED!")

if __name__ == "__main__":
    test_pdf_resume_upload_and_context_replacement()
