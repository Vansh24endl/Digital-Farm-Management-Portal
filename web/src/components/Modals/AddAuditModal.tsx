import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, ClipboardCheck, Plus, CheckCircle, Award, Building2 } from 'lucide-react';

export const AddAuditModal: React.FC = () => {
  const { activeModal, closeModal, addAudit, selectedFarmId } = useApp();

  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('Sector 2 · Feed Mill');
  const [dueDate, setDueDate] = useState('In 3 days');
  const [severity, setSeverity] = useState<'urgent' | 'attention' | 'routine'>('attention');
  const [auditor, setAuditor] = useState('Dr. Ananya Reyes');
  const [farmId, setFarmId] = useState(selectedFarmId || '');
  const [findings, setFindings] = useState('');
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (activeModal === 'add-audit') {
      api.getFarms()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          setFarms(list.map((f: any) => ({
            id: String(f._id || f.id),
            name: String(f.name || 'Unnamed Farm'),
          })));
          if (list.length > 0 && !farmId) {
            setFarmId(String(list[0]._id || list[0].id));
          }
        })
        .catch(() => {});
    }
  }, [activeModal]);

  if (activeModal !== 'add-audit') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addAudit({
        farmId: farmId || selectedFarmId || undefined,
        title: title || 'Biosecurity Decontamination Inspection',
        sector,
        dueDate,
        severity,
        auditor,
        findings,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[var(--lime)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Schedule New Inspection Audit</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          {farms.length > 0 && (
            <div>
              <label className="fd-label block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[var(--text-dim)]" /> Target Farm
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="fd-select w-full text-xs font-mono"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="fd-label block mb-1">Audit Protocol Title</label>
            <input
              type="text"
              placeholder="e.g. Footbath Virucide pH Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Target Sector</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="fd-label block mb-1">Priority Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="fd-select w-full text-xs font-mono"
              >
                <option value="urgent">Urgent Warning</option>
                <option value="attention">Needs Attention</option>
                <option value="routine">Routine Audit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="fd-label block mb-1">Lead Auditor</label>
              <input
                type="text"
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="fd-label block mb-1">Audit Scope / Initial Findings (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Scheduled biosecurity review for sanitization trench..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              className="fd-input w-full text-xs font-sans resize-none"
            />
          </div>

          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-[#111311] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Schedule in MongoDB
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
      <div className="w-full max-w-lg bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lime)]">
              Active Audit Inspector
            </span>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">{audit.title}</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto font-sans">
          {/* Progress Header */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between font-mono">
            <div>
              <p className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Completion Telemetry</p>
              <p className="text-lg font-bold text-[var(--lime)]">{audit.progress}% Complete</p>
            </div>
            <div className="w-28 bg-[var(--bg-main)] h-2.5 rounded-[2px] overflow-hidden border border-[var(--border-dim)]">
              <div
                className="bg-[var(--lime)] h-full transition-all duration-300"
                style={{ width: `${audit.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Inspection Verification Items
            </h4>
            {audit.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => toggleAuditItemDone(audit.id, idx)}
                className={`w-full p-2.5 rounded-[3px] border text-left flex items-start gap-2.5 transition-all ${
                  item.done
                    ? 'bg-[var(--success-bg)] border-[var(--success-dim)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-raised)] border-[var(--border-dim)] hover:border-[var(--lime)] text-[var(--text-secondary)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-[2px] border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.done
                      ? 'bg-[var(--success)] border-[var(--success)] text-[#111311]'
                      : 'border-[var(--border)] bg-[var(--bg-panel)]'
                  }`}
                >
                  {item.done && <CheckCircle className="w-3 h-3" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{item.text}</p>
                  <p className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">
                    {item.done ? 'Verified & Compliance Standard Met' : 'Click to inspect & mark compliant'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-between gap-3 font-mono">
            <span className="text-xs text-[var(--text-secondary)]">Inspector: {audit.auditor}</span>
            <button
              onClick={() => completeAudit(audit.id)}
              disabled={is100}
              className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] flex items-center gap-1.5 transition-all ${
                is100
                  ? 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-dim)] cursor-default'
                  : 'fd-btn'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {is100 ? 'Audit Certified' : 'Complete All & Certify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
