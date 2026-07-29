# React.js Frontend Web UI Walkthrough

A React 18 + Vite frontend web application ([web-ui](file:///home/robert/work/agents/projects/job-app/web-ui)) has been created and verified for the `job-app-agent` backend.

## Summary of Completed Changes

### 1. Project Infrastructure (`web-ui/`)
- Scaffolded Vite + React application in [web-ui/](file:///home/robert/work/agents/projects/job-app/web-ui).
- Configured Vite development server proxy in [vite.config.js](file:///home/robert/work/agents/projects/job-app/web-ui/vite.config.js) to forward `/run`, `/apps`, and `/health` requests to `http://localhost:8000`.
- Loaded Google Fonts (`Inter`, `JetBrains Mono`) in [index.html](file:///home/robert/work/agents/projects/job-app/web-ui/index.html).

### 2. Design System & CSS Styling
- Created a dark glassmorphic design system in [index.css](file:///home/robert/work/agents/projects/job-app/web-ui/src/index.css) using CSS variables.
- Added smooth background gradients, animated status pulses, user vs assistant message styling, scrollbar formatting, and keyframe animations.

### 3. API Integration
- Built [src/services/api.js](file:///home/robert/work/agents/projects/job-app/web-ui/src/services/api.js) to connect to `POST /run`, `POST /apps/app/users/{userId}/sessions`, and `GET /health`.

### 4. React Components
- **[Header.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/Header.jsx)**: Top navigation displaying agent branding, real-time backend connectivity status, session ID pill, and a "New Chat" reset button.
- **[ChatMessage.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/ChatMessage.jsx)**: Chat message container with Markdown rendering (`react-markdown`), user/bot avatars, timestamps, and 1-click text copy.
- **[ChatInput.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/ChatInput.jsx)**: Auto-expanding prompt input box with character handling, send button, and `Enter` shortcut.
- **[App.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/App.jsx)**: Main container handling message state, active session creation, typing indicator, and error banners.

---

## Visual Verification

### Live Chat Interface
The UI was launched on `http://localhost:5173` and tested against the live `job-app-agent` backend on `http://localhost:8000`:

![React Chatbot Interface](file:///home/robert/.gemini/antigravity-ide/brain/1ca2f88d-7efe-44f1-ad12-19dee16a37c5/agent_response_1784883253425.png)

### Automated Browser Subagent Recording
![Browser Session Video](file:///home/robert/.gemini/antigravity-ide/brain/1ca2f88d-7efe-44f1-ad12-19dee16a37c5/web_ui_chatbot_demo_1784883105054.webp)

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
