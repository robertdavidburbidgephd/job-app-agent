import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, X, Check, AlertCircle } from 'lucide-react';

export default function JobDescriptionModal({ 
  isOpen, 
  onClose, 
  onSaveJobDescription, 
  activeJobDescription 
}) {
  const [jobTitle, setJobTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (activeJobDescription) {
      setJobTitle(activeJobDescription.jobTitle || '');
      setText(activeJobDescription.jobDescription || '');
    } else {
      setJobTitle('');
      setText('');
    }
  }, [activeJobDescription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSaveJobDescription({ jobTitle: jobTitle.trim(), jobDescription: text.trim() });
    onClose();
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <ClipboardList size={20} color="#a5b4fc" />
            <h2>Target Job Description</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-info-notice">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>
                Pasting a new job description will <strong>replace</strong> the previous target job in the agent's context memory.
              </span>
            </p>

            <div className="form-group">
              <label htmlFor="job-title-input">Target Role / Company (Optional)</label>
              <input
                id="job-title-input"
                type="text"
                className="modal-input"
                placeholder="e.g. Senior Frontend Engineer at Google"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="job-desc-textarea">Job Description Plain Text</label>
              <textarea
                id="job-desc-textarea"
                className="modal-textarea"
                rows={8}
                placeholder="Paste the full job posting requirements, responsibilities, and qualifications here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div className="char-counter">
                {text.length.toLocaleString()} characters
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!text.trim()}
            >
              <Check size={16} />
              <span>Save Job Description</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
