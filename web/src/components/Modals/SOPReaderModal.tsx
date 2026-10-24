import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export const SOPReaderModal: React.FC = () => {
  const { activeModal, closeModal, activeTrainingTopic, showToast } = useApp();

  if (activeModal !== 'sop-reader' || !activeTrainingTopic) return null;

  const topic = activeTrainingTopic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[var(--lime)]" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lime)]">
                Clinical SOP Guideline ({topic.category})
              </span>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">{topic.title}</h3>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto font-sans">
          {/* Hero Banner */}
          <div className="relative rounded-[2px] overflow-hidden h-36 border border-[var(--border-dim)] bg-[var(--bg-raised)]">
            <img src={topic.image} alt={topic.title} className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)] via-transparent to-transparent p-3 flex items-end">
              <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-main)]/90 text-[var(--lime)] text-[10px] font-mono font-bold border border-[var(--border)]">
                {topic.readTime}
              </span>
            </div>
          </div>

          {/* SOP Overview */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">
              Executive Summary
            </h4>
            <p className="text-xs font-sans text-[var(--text-primary)] leading-relaxed">{topic.summary}</p>
          </div>

          {/* Standard Operating Procedure Steps */}
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--lime)] mb-2">
              Standard Operating Protocols (SOP Steps)
            </h4>
            <div className="space-y-1.5">
              {topic.content.map((step, idx) => (
                <div key={idx} className="fd-raised p-2.5 rounded-[3px] border border-[var(--border-dim)] text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  <span className="font-mono text-[var(--lime)] font-bold mr-1.5">0{idx + 1}.</span> {step}
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Rules */}
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--warning)] mb-2">
              Mandatory Biosecurity Directives
            </h4>
            <div className="space-y-1.5">
              {topic.checklistRules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono text-[var(--text-primary)]">
                  <CheckCircle className="w-3.5 h-3.5 text-[var(--success)] flex-shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[var(--bg-main)] border-t border-[var(--border)] flex items-center justify-between">
          <button onClick={closeModal} className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider">
            Close Reader
          </button>
          <button
            onClick={() => {
              showToast(`Completed reading: ${topic.title}`);
              closeModal();
            }}
            className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Mark SOP Read & Complete
          </button>
        </div>
      </div>
    </div>
  );
};
