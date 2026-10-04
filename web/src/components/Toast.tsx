import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1b1b22] border border-[#c0c1ff]/60 text-slate-100 shadow-2xl animate-bounce">
      <CheckCircle2 className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
      <span className="text-xs sm:text-sm font-semibold font-sans">{toastMessage}</span>
    </div>
  );
};
