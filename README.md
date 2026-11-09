Created with Antigravity IDE 2.0.4 -- see LOG.md and artefacts/ for details.

## 📱 Querying from Web / Firefox Browser (Android Mobile)

### Running Locally on Your Local Network
To test or access the agent from a browser (including Firefox on an Android phone on your local Wi-Fi):

1. **Start the FastAPI Server**:
   ```bash
   cd job-app-agent
   uv run uvicorn app.fast_api_app:app --host 0.0.0.0 --port 8000
   ```
2. **Open Firefox on Android**:
   Navigate to `http://<your-computer-local-ip>:8000/docs` (Swagger UI) or query the OpenAPI endpoints.

---

## How to Run locally

1. **Start Backend Server**:
   ```bash
   cd job-app-agent
   uv run python -m app.fast_api_app
   ```

2. **Start React Frontend UI**:
   ```bash
   cd web-ui
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:5173`.

---

## Troubleshooting

1. **500 Internal Server Error**
   Set up billing in `job-app-agent/.env`:
   ```GOOGLE_CLOUD_PROJECT=<your-project-id>
   ```
