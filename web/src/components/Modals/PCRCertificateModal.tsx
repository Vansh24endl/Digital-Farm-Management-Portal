import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, Download, Award, Dna } from 'lucide-react';


export const PCRCertificateModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();

  if (activeModal !== 'pcr-certificate') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#12131a] rounded-2xl border border-[#c0c1ff]/50 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#1a178c]/40 border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-[#c0c1ff]" />
            <div>
              <h3 className="text-base font-bold font-serif text-white">Diagnostic PCR Laboratory Certificate</h3>
              <p className="text-xs text-[#c0c1ff] font-sans">Official Molecular Diagnostics & Serology Report</p>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto font-sans">
          {/* Top Info Banner */}
          <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#34343c] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Certificate ID</span>
              <p className="text-sm font-mono font-bold text-[#c0c1ff]">PCR-2026-OCT-09411</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Specimen Batch</span>
              <p className="text-sm font-semibold text-slate-200">Swine Farrowing Pen #14 (Pooled Swabs)</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Lab Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4CAF50] bg-[#316342]/40 px-2 py-0.5 rounded-full border border-[#4CAF50]/40">
                <ShieldCheck className="w-3.5 h-3.5" /> PASSED / NEGATIVE
              </span>
            </div>
          </div>

          {/* Pathogen Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pathogen Amplification Panel (Real-Time RT-PCR)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#34343c]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1b1b22] text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Pathogen Target</th>
                    <th className="p-3">Assay Method</th>
                    <th className="p-3">Ct Threshold</th>
                    <th className="p-3">Diagnostic Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34343c] bg-[#1f1f26]">
                  <tr>
                    <td className="p-3 font-semibold text-white">African Swine Fever Virus (ASFV)</td>
                    <td className="p-3 text-slate-300">p72 Gene RT-PCR</td>
                    <td className="p-3 font-mono text-slate-400">Ct &gt; 40.0</td>
                    <td className="p-3 font-bold text-[#4CAF50]">NOT DETECTED</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Porcine Reproductive & Resp (PRRSv)</td>
                    <td className="p-3 text-slate-300">ORF7 Multiplex</td>
                    <td className="p-3 font-mono text-slate-400">Ct &gt; 40.0</td>
                    <td className="p-3 font-bold text-[#4CAF50]">NOT DETECTED</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Classical Swine Fever (CSFV)</td>
                    <td className="p-3 text-slate-300">5' UTR qPCR</td>
                    <td className="p-3 font-mono text-slate-400">Ct &gt; 40.0</td>
                    <td className="p-3 font-bold text-[#4CAF50]">NOT DETECTED</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Foot & Mouth Disease (FMDv)</td>
                    <td className="p-3 text-slate-300">3D Region qPCR</td>
                    <td className="p-3 font-mono text-slate-400">Ct &gt; 40.0</td>
                    <td className="p-3 font-bold text-[#4CAF50]">NOT DETECTED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Attestation & Signature */}
          <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#34343c] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-[#c0c1ff]" />
              <div>
                <p className="text-xs font-bold text-white">Certified by Dr. Ananya Reyes</p>
                <p className="text-[11px] text-slate-400">Lead Veterinary Pathologist · Central Bio-Lab</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono">Timestamp: 2026-10-04 14:20 UTC</span>
              <p className="text-xs text-[#4CAF50] font-bold">Digital Signature Verified</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1b1b22] border-t border-[#34343c] flex items-center justify-between">
          <button
            onClick={() => {
              showToast('Diagnostic PCR PDF downloaded to local storage.');
              closeModal();
            }}
            className="px-4 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Download Official PDF Report
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
