import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Camera, Upload, Link, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ChangeDPModal: React.FC = () => {
  const { activeModal, closeModal, userProfile, updateAvatar, currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState(userProfile.avatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (activeModal !== 'change-dp') return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please select a smaller photo.');
      return;
    }

    // Validate format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Unsupported format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setPreviewUrl(dataUri);
      setCustomUrl('');
      setFileName(file.name);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setUploadError('');
    setCustomUrl(url);
    setFileName('');
    if (url.trim()) {
      setPreviewUrl(url.trim());
    } else {
      setPreviewUrl(userProfile.avatar || '');
    }
  };

  const handleApply = () => {
    const finalUrl = previewUrl.trim();
    if (!finalUrl) {
      setUploadError('Please select an image file or enter an image URL.');
      return;
    }
    updateAvatar(finalUrl);
  };

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'FD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[var(--lime)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
              Update Profile Picture
            </h3>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 font-sans text-xs">
          {/* Active Preview */}
          <div className="flex items-center gap-4 p-3 rounded-[3px] bg-[var(--bg-raised)] border border-[var(--border-dim)]">
            <div className="relative flex-shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="DP Preview"
                  className="w-16 h-16 rounded-[2px] object-cover border border-[var(--border)] shadow-sm"
                  onError={() => {
                    setPreviewUrl('');
                    setUploadError('Unable to render image from provided URL.');
                  }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-[2px] flex items-center justify-center font-bold font-display text-lg border border-[var(--border)]"
                  style={{ background: 'rgba(163, 230, 53, 0.15)', color: 'var(--lime)' }}
                >
                  {getInitials(userProfile.name || currentUser?.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
                Live Photo Preview
              </p>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] truncate">
                {userProfile.name || currentUser?.name || 'Farm Specialist'}
              </p>
              {fileName && (
                <p className="text-[10px] text-[var(--lime)] font-mono flex items-center gap-1 mt-1 truncate">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-2.5 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Option 1: File Upload */}
          <div className="space-y-1.5">
            <label className="fd-label flex items-center gap-1">
              <Upload className="w-3 h-3 text-[var(--lime)]" />
              <span>Upload Local Photo (JPEG, PNG, WebP · Max 5MB):</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 px-3 rounded-[2px] border border-dashed border-[var(--border)] hover:border-[var(--lime)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center gap-2 font-mono"
            >
              <Upload className="w-4 h-4 text-[var(--lime)]" />
              <span>{isProcessing ? 'Processing image...' : 'Browse Local Image File'}</span>
            </button>
          </div>

          {/* Option 2: Image URL Input */}
          <div className="space-y-1.5">
            <label className="fd-label flex items-center gap-1">
              <Link className="w-3 h-3 text-[var(--lime)]" />
              <span>Or Paste Direct Image URL:</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={customUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="fd-input w-full text-xs font-mono py-2"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!previewUrl || isProcessing}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Save Profile Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeDPModal;
