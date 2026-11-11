Created with Antigravity IDE 2.0.4 -- see LOG.md and artefacts/ for details.

You will need a Google Cloud project-id with a billing account.

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

## To Deploy

```bash
gcloud config set project <your-project-id>
agents-cli deploy --no-confirm-project
```

Or,

```bash
gcloud run deploy job-app-agent --project <your-project-id> --region <your-region> --source . --memory 4Gi --cpu 1 --min-instances 0 --max-instances 10 --concurrency 8 --no-allow-unauthenticated --no-cpu-throttling
```

## Troubleshooting

1. **500 Internal Server Error**
   Set up billing in `job-app-agent/.env`:
   ```bash
   GOOGLE_CLOUD_PROJECT=<your-project-id>
   ```
2. **403 on deploy**
   Check gcloud with:
   ```bash
   agents-cli deploy --no-confirm-project -n
   ```
   Follow the links to eg. enable the IAM API and/or create a service account.

```bash
ALLOW_ORIGINS="http://127.0.0.1:5173,http://localhost:8000"
```

`https://docs.cloud.google.com/run/docs/troubleshooting#container-failed-to-start`

