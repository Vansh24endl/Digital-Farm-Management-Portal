import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export const SOPReaderModal: React.FC = () => {
  const { activeModal, closeModal, activeTrainingTopic, showToast } = useApp();

  if (activeModal !== 'sop-reader' || !activeTrainingTopic) return null;

  const topic = activeTrainingTopic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#c0c1ff]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c0c1ff]">
                Clinical SOP Guideline ({topic.category})
              </span>
              <h3 className="text-base font-bold font-serif text-white">{topic.title}</h3>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sans">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden h-40 border border-[#34343c]">
            <img src={topic.image} alt={topic.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12131a] via-[#12131a]/40 to-transparent p-4 flex items-end">
              <span className="px-2.5 py-1 rounded-full bg-[#1a178c]/80 text-[#c0c1ff] text-xs font-semibold border border-[#c0c1ff]/30">
                {topic.readTime}
              </span>
            </div>
          </div>

          {/* SOP Overview */}
          <div className="p-4 rounded-xl bg-[#1f1f26] border border-[#34343c]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Executive Summary
            </h4>
            <p className="text-sm text-slate-200">{topic.summary}</p>
          </div>

          {/* Standard Operating Procedure Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c0c1ff] mb-3">
              Standard Operating Protocols (SOP Steps)
            </h4>
            <div className="space-y-2">
              {topic.content.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#1b1b22] border border-[#34343c] text-xs text-slate-200 leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Rules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffba3f] mb-2">
              Mandatory Biosecurity Rules
            </h4>
            <div className="space-y-1.5">
              {topic.checklistRules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1b1b22] border-t border-[#34343c] flex items-center justify-between">
          <button onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
            Close Reader
          </button>
          <button
            onClick={() => {
              showToast(`Completed reading: ${topic.title}`);
              closeModal();
            }}
            className="px-5 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <ShieldCheck className="w-4 h-4" /> Mark SOP Read & Complete
          </button>
        </div>
      </div>
    </div>
  );
};
