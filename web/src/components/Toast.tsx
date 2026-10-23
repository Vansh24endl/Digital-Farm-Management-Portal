import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 animate-fadeIn"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--success-dim)',
        borderRadius: '3px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
      <span
        className="text-xs font-semibold"
        style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }}
      >
        {toastMessage}
      </span>
    </div>
  );
};
