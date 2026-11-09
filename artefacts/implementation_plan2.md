# Implement React.js Frontend UI for `job-app-agent`

Create a modern, responsive React.js web interface (Vite-powered) for interacting with the `job-app-agent` backend API. The chatbot UI will feature a sleek dark/glassmorphic aesthetic, auto-scrolling message history, typing indicators, session management, and robust API error handling.

## Proposed Architecture & Design

### 1. Technology Stack
- **Framework**: React.js with Vite (`web-ui` directory)
- **Styling**: Vanilla CSS with CSS custom properties (Design Tokens for dark mode, glassmorphism, gradients, micro-animations, custom scrollbars)
- **HTTP Client**: Native `fetch` with Vite dev proxy pointing to `http://localhost:8000`

### 2. Backend Integration Details
The UI will connect directly to `job-app-agent` backend endpoints:
- `POST /run`: Sends user prompt inside a `RunAgentRequest`:
  ```json
  {
    "appName": "job-app-agent",
    "userId": "default-user",
    "sessionId": "<active-session-id>",
    "newMessage": {
      "role": "user",
      "parts": [{ "text": "<user-prompt>" }]
    }
  }
  ```
- Processes the returned array of `Event` objects to extract model response parts and updates the message list.
- Automatically handles creating new sessions (`POST /apps/job-app-agent/users/{userId}/sessions`) when starting a fresh chat.

---

## User Review Required

> [!IMPORTANT]
> - **Directory Location**: The React application will be created in `web-ui/` alongside `job-app-agent/` in the project root.
> - **Backend Dependency**: To test live responses in the browser, the FastAPI backend in `job-app-agent` must be running locally on port 8000 (`uv run python -m app.fast_api_app` or `uv run adk run`).

---

## Proposed Changes

### Frontend Directory (`web-ui/`)

#### [NEW] [package.json](file:///home/robert/work/agents/projects/job-app/web-ui/package.json)
Configures React 18+, Vite, and script aliases (`dev`, `build`, `preview`).

#### [NEW] [vite.config.js](file:///home/robert/work/agents/projects/job-app/web-ui/vite.config.js)
Sets up Vite development server with API proxying to `http://localhost:8000` for `/run` and `/apps` paths to prevent CORS issues.

#### [NEW] [index.html](file:///home/robert/work/agents/projects/job-app/web-ui/index.html)
Includes modern typography from Google Fonts (Inter) and appropriate meta tags / page titles.

#### [NEW] [src/index.css](file:///home/robert/work/agents/projects/job-app/web-ui/src/index.css)
Defines design system tokens (dark palette, electric blue/violet accent gradients, smooth transitions, card glassmorphism, scrollbar styles, and keyframe animations).

#### [NEW] [src/services/api.js](file:///home/robert/work/agents/projects/job-app/web-ui/src/services/api.js)
Provides helper functions:
- `createSession(userId)`
- `sendMessage({ userId, sessionId, prompt })`
- `checkBackendHealth()`

#### [NEW] [src/components/Header.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/Header.jsx)
Top bar containing agent branding, live backend status indicator, session ID display, and "New Chat" reset button.

#### [NEW] [src/components/ChatMessage.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/ChatMessage.jsx)
Message bubble component supporting user/assistant styling, avatar icons, markdown formatting, copy-to-clipboard buttons, and timestamps.

#### [NEW] [src/components/ChatInput.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/components/ChatInput.jsx)
Auto-expanding input textarea with character count, submit button, and keyboard shortcut support (Enter to send, Shift+Enter for new line).

#### [NEW] [src/App.jsx](file:///home/robert/work/agents/projects/job-app/web-ui/src/App.jsx)
Main application container orchestrating chat state, active session, loading/typing indicator state, and error banners.

---

## Verification Plan

### Automated Build & Lint Verification
1. Run `npm install` inside `web-ui/` to install React and Vite dependencies.
2. Run `npm run build` inside `web-ui/` to ensure clean TypeScript/JS syntax and bundle creation.

### Manual Verification
1. Start the backend agent service: `cd job-app-agent && uv run python -m app.fast_api_app`.
2. Start the Vite dev server: `cd web-ui && npm run dev`.
3. Open the browser to test:
   - Initial greeting and backend online status badge.
   - Sending a text message and receiving agent response.
   - Starting a new chat session.
