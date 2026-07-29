import React, { useState } from 'react';
import { Bot, RefreshCw, ClipboardList, CheckCircle2 } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import JobDescriptionModal from './JobDescriptionModal';

export default function Header({ 
  isOnline, 
  sessionId, 
  onNewChat, 
  onUploadResume, 
  activeResume, 
  isUploadingResume,
  onSaveJobDescription,
  activeJobDescription
}) {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <Bot size={24} />
        </div>
        <div className="brand-info">
          <h1>Job App Assistant</h1>
          <p>AI Career & Resume Agent</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className={`btn-secondary ${activeJobDescription ? 'active-resume-btn' : ''}`}
          onClick={() => setIsJobModalOpen(true)}
          title={
            activeJobDescription
              ? `Target Job Active (${activeJobDescription.charCount} chars). Click to view/edit.`
              : 'Paste target Job Description plain text to inject into agent context'
          }
        >
          <ClipboardList size={16} color={activeJobDescription ? '#a5b4fc' : 'currentColor'} />
          <span>
            {activeJobDescription
              ? activeJobDescription.jobTitle
                ? (activeJobDescription.jobTitle.length > 15 ? `${activeJobDescription.jobTitle.slice(0, 12)}...` : activeJobDescription.jobTitle)
                : 'Target Job Active'
              : 'Target Job'}
          </span>
          {activeJobDescription && <CheckCircle2 size={14} color="#10b981" />}
        </button>

        <ResumeUpload 
          onUploadResume={onUploadResume}
          activeResume={activeResume}
          isUploading={isUploadingResume}
        />

        <div className="status-badge" title={isOnline ? 'Backend service online' : 'Backend service offline/reconnecting'}>
          <span className={`status-dot ${isOnline ? 'online' : ''}`} />
          <span>{isOnline ? 'Backend Ready' : 'Connecting...'}</span>
        </div>

        {sessionId && (
          <div className="status-badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            ID: {sessionId.slice(0, 10)}...
          </div>
        )}

        <button 
          className="btn-secondary" 
          onClick={onNewChat}
          title="Start a new chat session"
        >
          <RefreshCw size={16} />
          <span>New Chat</span>
        </button>
      </div>

      <JobDescriptionModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSaveJobDescription={onSaveJobDescription}
        activeJobDescription={activeJobDescription}
      />
    </header>
  );
}
