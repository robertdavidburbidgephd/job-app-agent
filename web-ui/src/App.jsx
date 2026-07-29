import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { checkBackendHealth, createSession, sendMessage, uploadResume, setJobDescription } from './services/api';
import { Bot, AlertCircle } from 'lucide-react';

const USER_ID = 'default-user';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [activeJobDescription, setActiveJobDescription] = useState(null);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial setup: Check backend status & initialize session
  useEffect(() => {
    async function init() {
      const healthy = await checkBackendHealth();
      setIsOnline(healthy);

      const newSession = await createSession(USER_ID);
      setSessionId(newSession);
    }
    init();

    // Poll health status periodically
    const interval = setInterval(async () => {
      const healthy = await checkBackendHealth();
      setIsOnline(healthy);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleNewChat = async () => {
    setMessages([]);
    setError(null);
    setActiveResume(null);
    setActiveJobDescription(null);
    setIsLoading(true);
    try {
      const newSession = await createSession(USER_ID);
      setSessionId(newSession);
    } catch (err) {
      console.error('Failed to create new session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadResume = async (file) => {
    setError(null);
    setIsUploadingResume(true);
    try {
      let activeSession = sessionId;
      if (!activeSession) {
        activeSession = await createSession(USER_ID);
        setSessionId(activeSession);
      }

      const res = await uploadResume({
        userId: USER_ID,
        sessionId: activeSession,
        file: file,
      });

      setActiveResume({
        filename: res.filename,
        charCount: res.char_count,
      });

      const sysMessage = {
        id: `sys-cv-${Date.now()}`,
        sender: 'agent',
        text: `📄 **Resume Context Updated**: Successfully uploaded **${res.filename}** (${res.char_count.toLocaleString()} characters). The previous CV has been replaced in the agent's context window.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, sysMessage]);
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err.message || 'Failed to upload PDF resume.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSaveJobDescription = async ({ jobTitle, jobDescription }) => {
    setError(null);
    setIsLoading(true);
    try {
      let activeSession = sessionId;
      if (!activeSession) {
        activeSession = await createSession(USER_ID);
        setSessionId(activeSession);
      }

      const res = await setJobDescription({
        userId: USER_ID,
        sessionId: activeSession,
        jobDescription: jobDescription,
        jobTitle: jobTitle,
      });

      setActiveJobDescription({
        jobTitle: res.job_title || jobTitle,
        jobDescription: jobDescription,
        charCount: res.char_count,
      });

      const titleStr = res.job_title ? ` for **${res.job_title}**` : '';
      const sysMessage = {
        id: `sys-jd-${Date.now()}`,
        sender: 'agent',
        text: `📋 **Target Job Description Updated**: Active target job context set${titleStr} (${res.char_count.toLocaleString()} characters). Any previous job description has been replaced in the agent's context window.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, sysMessage]);
    } catch (err) {
      console.error('Error saving job description:', err);
      setError(err.message || 'Failed to update target job description.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (prompt) => {
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let activeSession = sessionId;
      if (!activeSession) {
        activeSession = await createSession(USER_ID);
        setSessionId(activeSession);
      }

      const responseText = await sendMessage({
        userId: USER_ID,
        sessionId: activeSession,
        prompt: prompt,
      });

      const agentMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to get response from agent. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header 
        isOnline={isOnline} 
        sessionId={sessionId} 
        onNewChat={handleNewChat}
        onUploadResume={handleUploadResume}
        activeResume={activeResume}
        isUploadingResume={isUploadingResume}
        onSaveJobDescription={handleSaveJobDescription}
        activeJobDescription={activeJobDescription}
      />

      <main className="chat-main">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-icon-large">
                <Bot size={36} />
              </div>
              <h2>How can I help with your job search?</h2>
              <p>
                Paste your Target Job Description or upload your CV/Resume (PDF) to tailor cover letters, optimize your resume, or prepare for interviews.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}

          {isLoading && (
            <div className="message-item agent">
              <div className="avatar">
                <Bot size={18} />
              </div>
              <div className="typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="error-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || isUploadingResume} 
        />
      </main>
    </div>
  );
}
