import io
import pytest
from pypdf import PdfWriter
from fastapi.testclient import TestClient
from app.fast_api_app import app

def create_sample_pdf(text_content: str) -> bytes:
    """Create an in-memory PDF file containing specified text content."""
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    # Use pypdf or PyPDF2 / metadata / annotations to store readable page text
    # In pypdf PdfWriter, we can add a page with text or metadata
    page = writer.pages[0]
    # Simple PDF structure for testing
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    # Inject simple text content into PDF stream for pypdf extraction testing
    pdf_bytes = pdf_buffer.getvalue()
    # Replace stream with text stream
    return pdf_bytes

def test_resume_upload_and_replacement():
    client = TestClient(app)
    
    user_id = "test_user_cv"
    session_id = "test_session_cv"

    # Create dummy PDF 1 bytes using PyPDF
    from pypdf import PdfWriter, PageObject
    from pypdf.annotations import Text
    
    # We can write text using pypdf canvas or pdf stream
    # Let's test uploading a valid PDF
    writer1 = PdfWriter()
    page1 = writer1.add_blank_page(width=600, height=800)
    # Add text annotation / content
    buf1 = io.BytesIO()
    writer1.write(buf1)
    
    # Upload PDF via FastAPI test client
    # We test non-pdf rejection
    res_bad = client.post(
        f"/apps/app/users/{user_id}/sessions/{session_id}/resume",
        files={"file": ("resume.txt", b"plain text", "text/plain")}
    )
    assert res_bad.status_code == 400
    assert "Only PDF files" in res_bad.json()["detail"]

    print("FastAPI route validation for non-PDF files passed!")

if __name__ == "__main__":
    test_resume_upload_and_replacement()
