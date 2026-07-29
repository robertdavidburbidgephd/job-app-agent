/**
 * API service for communicating with job-app-agent backend endpoints.
 */

const APP_NAME = 'app';

/**
 * Check backend health status.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch('/health');
    if (!res.ok) return false;
    return true;
  } catch (err) {
    console.warn('Backend health check failed:', err);
    return false;
  }
}

/**
 * Create a new agent session for a given user.
 */
export async function createSession(userId = 'default-user') {
  try {
    const res = await fetch(`/apps/${APP_NAME}/users/${encodeURIComponent(userId)}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      throw new Error(`Session creation failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.id || data.sessionId || `session-${Date.now()}`;
  } catch (err) {
    console.error('Error creating session:', err);
    // Fallback to local session ID if endpoint is offline or using in-memory default
    return `session-${Date.now()}`;
  }
}

/**
 * Send user prompt to the agent via POST /run.
 * Extracts model response text from event payload array.
 */
export async function sendMessage({ userId = 'default-user', sessionId, prompt }) {
  const payload = {
    appName: APP_NAME,
    userId: userId,
    sessionId: sessionId,
    newMessage: {
      role: 'user',
      parts: [{ text: prompt }],
    },
  };

  const res = await fetch('/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Agent request failed (${res.status}): ${errorText || res.statusText}`);
  }

  const events = await res.json();
  
  if (!Array.isArray(events) || events.length === 0) {
    return 'No response returned from agent.';
  }

  // Aggregate model text from all event content parts
  let responseText = '';
  for (const event of events) {
    if (event.content && Array.isArray(event.content.parts)) {
      for (const part of event.content.parts) {
        if (part.text) {
          responseText += part.text;
        }
      }
    }
  }

  return responseText.trim() || 'Agent completed turn without text output.';
}

/**
 * Upload a PDF CV/Resume file for a session.
 * Overwrites any previously active resume in session context.
 */
export async function uploadResume({ userId = 'default-user', sessionId, file }) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/apps/${APP_NAME}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/resume`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Upload failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Update or replace plain text target Job Description for a session.
 * Overwrites any previously active job description in session context.
 */
export async function setJobDescription({ userId = 'default-user', sessionId, jobDescription, jobTitle = '' }) {
  const res = await fetch(`/apps/${APP_NAME}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/job-description`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_description: jobDescription,
      job_title: jobTitle,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to update job description (${res.status})`);
  }

  return await res.json();
}


