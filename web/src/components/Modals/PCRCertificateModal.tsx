import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, Download, Award, Dna } from 'lucide-react';

export const PCRCertificateModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();

  if (activeModal !== 'pcr-certificate') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dna className="w-5 h-5 text-[var(--text-primary)]" />
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Diagnostic PCR Laboratory Certificate</h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">Official Serology & Molecular Diagnostics Verification</p>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
          {/* Top Info Banner */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Certificate ID</span>
              <p className="text-xs font-bold text-[var(--text-primary)]">PCR-2026-OCT-09411</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Specimen Batch</span>
              <p className="text-xs font-semibold text-[var(--text-primary)]">Swine Farrowing Pen #14 (Pooled Swabs)</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] block">Lab Status</span>
              <span className="fd-badge fd-badge-success text-xs font-mono inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> PASSED / NEGATIVE
              </span>
            </div>
          </div>

          {/* Pathogen Breakdown Table */}
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Pathogen Amplification Panel (Real-Time RT-PCR)
            </h4>
            <div className="overflow-x-auto rounded-[3px] border border-[var(--border-dim)]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-2.5">Pathogen Target</th>
                    <th className="p-2.5">Assay Method</th>
                    <th className="p-2.5">Ct Threshold</th>
                    <th className="p-2.5">Diagnostic Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-dim)] bg-[var(--bg-panel)]">
                  <tr>
                    <td className="p-2.5 font-semibold text-[var(--text-primary)] font-sans">African Swine Fever Virus (ASFV)</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">p72 Gene RT-PCR</td>
                    <td className="p-2.5 text-[var(--text-dim)]">Ct &gt; 40.0</td>
                    <td className="p-2.5"><span className="fd-badge fd-badge-success text-[10px]">NOT DETECTED</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[var(--text-primary)] font-sans">Porcine Reproductive & Resp (PRRSv)</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">ORF7 Multiplex</td>
                    <td className="p-2.5 text-[var(--text-dim)]">Ct &gt; 40.0</td>
                    <td className="p-2.5"><span className="fd-badge fd-badge-success text-[10px]">NOT DETECTED</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[var(--text-primary)] font-sans">Classical Swine Fever (CSFV)</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">5' UTR qPCR</td>
                    <td className="p-2.5 text-[var(--text-dim)]">Ct &gt; 40.0</td>
                    <td className="p-2.5"><span className="fd-badge fd-badge-success text-[10px]">NOT DETECTED</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[var(--text-primary)] font-sans">Foot & Mouth Disease (FMDv)</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">3D Region qPCR</td>
                    <td className="p-2.5 text-[var(--text-dim)]">Ct &gt; 40.0</td>
                    <td className="p-2.5"><span className="fd-badge fd-badge-success text-[10px]">NOT DETECTED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Attestation & Signature */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-7 h-7 text-[var(--text-primary)]" />
              <div>
                <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">Certified by Dr. Ananya Reyes</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">Lead Veterinary Pathologist · Central Bio-Lab</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-[var(--text-dim)] block">Timestamp: 2026-10-04 14:20 UTC</span>
              <p className="text-xs text-[var(--success)] font-bold">Digital Signature Verified</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[var(--bg-main)] border-t border-[var(--border)] flex items-center justify-between">
          <button
            onClick={() => {
              showToast('Diagnostic PCR PDF downloaded to local storage.');
              closeModal();
            }}
            className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download Official PDF Report
          </button>
          <button
            onClick={closeModal}
            className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
