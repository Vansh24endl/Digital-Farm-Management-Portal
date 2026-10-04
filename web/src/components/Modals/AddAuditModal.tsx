import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ClipboardCheck, Plus, CheckCircle, Award } from 'lucide-react';

export const AddAuditModal: React.FC = () => {
  const { activeModal, closeModal, addAudit } = useApp();

  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('Sector 2 · Feed Mill');
  const [dueDate, setDueDate] = useState('In 3 days');
  const [severity, setSeverity] = useState<'urgent' | 'attention' | 'routine'>('attention');
  const [auditor, setAuditor] = useState('Dr. Ananya Reyes');

  if (activeModal !== 'add-audit') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAudit({
      title: title || 'Biosecurity Decontamination Inspection',
      sector,
      dueDate,
      severity,
      auditor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-serif text-white">Schedule New Inspection Audit</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Protocol Title</label>
            <input
              type="text"
              placeholder="e.g. Footbath Virucide pH Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Sector</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              >
                <option value="urgent">Urgent Warning</option>
                <option value="attention">Needs Attention</option>
                <option value="routine">Routine Audit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Auditor</label>
              <input
                type="text"
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#34343c] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Schedule Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AuditInspectorModal: React.FC = () => {
  const { activeModal, closeModal, activeAuditInspection, toggleAuditItemDone, completeAudit } = useApp();

  if (activeModal !== 'audit-inspector' || !activeAuditInspection) return null;

  const audit = activeAuditInspection;
  const is100 = audit.progress === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c0c1ff]">
              Active Audit Inspector
            </span>
            <h3 className="text-base font-bold font-serif text-white">{audit.title}</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Progress Header */}
          <div className="p-4 rounded-xl bg-[#1f1f26] border border-[#34343c] flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Completion Status</p>
              <p className="text-xl font-display font-bold text-white">{audit.progress}% Complete</p>
            </div>
            <div className="w-24 bg-[#12131a] h-3 rounded-full overflow-hidden border border-[#34343c]">
              <div
                className="bg-gradient-to-r from-[#1a178c] to-[#c0c1ff] h-full transition-all duration-300"
                style={{ width: `${audit.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspection Verification Items
            </h4>
            {audit.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => toggleAuditItemDone(audit.id, idx)}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  item.done
                    ? 'bg-[#316342]/20 border-[#4CAF50]/50 text-slate-200'
                    : 'bg-[#1b1b22] border-[#34343c] hover:border-[#c0c1ff]/40 text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.done
                      ? 'bg-[#4CAF50] border-[#4CAF50] text-black'
                      : 'border-slate-500 bg-[#12131a]'
                  }`}
                >
                  {item.done && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={`text-xs font-semibold ${item.done ? 'line-through text-slate-400' : ''}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#1b1b22] border-t border-[#34343c] flex items-center justify-between">
          <button onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
            Close Draft
          </button>
          <button
            onClick={() => completeAudit(audit.id)}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg ${
              is100
                ? 'bg-[#4CAF50] text-black hover:bg-[#4CAF50]/90 font-extrabold'
                : 'bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40'
            }`}
          >
            <Award className="w-4 h-4" /> {is100 ? 'Audit 100% Passed (Done)' : 'Mark Audit Complete (100%)'}
          </button>
        </div>
      </div>
    </div>
  );
};
