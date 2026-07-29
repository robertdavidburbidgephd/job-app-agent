import React, { useRef, useState } from 'react';
import { FileText, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ResumeUpload({ onUploadResume, activeResume, isUploading }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file (.pdf).');
      return;
    }

    onUploadResume(file);
    // Reset file input value so user can re-upload the same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="resume-upload-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
      />

      <button
        type="button"
        className={`btn-secondary ${activeResume ? 'active-resume-btn' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title={
          activeResume
            ? `Active Resume: ${activeResume.filename}. Click to upload a new PDF (will replace current resume).`
            : 'Upload PDF CV/Resume to inject into agent context'
        }
      >
        {isUploading ? (
          <>
            <Loader2 size={16} className="spin-icon" />
            <span>Updating CV...</span>
          </>
        ) : activeResume ? (
          <>
            <FileText size={16} color="#60a5fa" />
            <span style={{ color: '#93c5fd', fontWeight: 600 }}>
              {activeResume.filename.length > 15
                ? `${activeResume.filename.slice(0, 12)}...pdf`
                : activeResume.filename}
            </span>
            <CheckCircle2 size={14} color="#10b981" />
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>Upload CV (PDF)</span>
          </>
        )}
      </button>
    </div>
  );
}
