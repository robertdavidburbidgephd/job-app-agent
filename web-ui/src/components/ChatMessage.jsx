import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-item ${isUser ? 'user' : 'agent'}`}>
      <div className="avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-bubble">
        <div className="markdown-content">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>

        <div className="message-meta">
          <span>{message.timestamp}</span>
          {!isUser && (
            <button 
              onClick={handleCopy} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              title="Copy response"
            >
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : ''}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
