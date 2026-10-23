import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText, Download, ShieldCheck, CheckCircle2, Users, Package, Activity,
  ArrowUpRight, RefreshCw,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

type Report = {
  id: string;
  farmName: string;
  animalType: string;
  symptoms: string;
  description?: string;
  severity: string;
  status: string;
  createdAt?: string;
};

type Audit = { id: string; status: string };
type Visitor = { id: string; checkOut?: string | null };
type InventoryItem = { id: string; quantity: number; minimumStock: number };

async function getData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`API returned a non-JSON response for ${endpoint} (${response.status}). Check backend URL and route mounting.`);
  }
  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Failed to load ${endpoint}`);
  }
  return result.data as T;
}

function dateLabel(value?: string) {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not recorded' : date.toLocaleDateString();
}

export const ReportsScreen: React.FC = () => {
  const { openModal } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reportData, auditData, visitorData, inventoryData] = await Promise.all([
        getData<any[]>('/disease-reports'),
        getData<any[]>('/audits'),
        getData<any[]>('/visitors'),
        getData<any[]>('/inventory'),
      ]);
      setReports((Array.isArray(reportData) ? reportData : []).map((r: any) => ({
        id: String(r._id || r.id),
        farmName: r.farmId && typeof r.farmId === 'object' ? r.farmId.name || 'Farm' : 'Farm',
        animalType: String(r.animalType || 'unknown'),
        symptoms: String(r.symptoms || 'No symptoms recorded'),
        description: r.description ? String(r.description) : '',
        severity: String(r.severity || 'unknown'),
        status: String(r.status || 'reported'),
        createdAt: r.createdAt,
      })));
      setAudits((Array.isArray(auditData) ? auditData : []).map((a: any) => ({
        id: String(a._id || a.id), status: String(a.status || 'pending').toLowerCase(),
      })));
      setVisitors((Array.isArray(visitorData) ? visitorData : []).map((v: any) => ({
        id: String(v._id || v.id), checkOut: v.checkOut || null,
      })));
      setInventory((Array.isArray(inventoryData) ? inventoryData : []).map((i: any) => ({
        id: String(i._id || i.id), quantity: Number(i.quantity || 0), minimumStock: Number(i.minimumStock || 0),
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
    const onUpdate = () => void loadReports();
    ['disease-reports-updated', 'audits-updated', 'visitors-updated', 'inventory-updated'].forEach((eventName) =>
      window.addEventListener(eventName, onUpdate)
    );
    return () => {
      ['disease-reports-updated', 'audits-updated', 'visitors-updated', 'inventory-updated'].forEach((eventName) =>
        window.removeEventListener(eventName, onUpdate)
      );
    };
  }, [loadReports]);

  const completedAudits = audits.filter((a) => a.status === 'completed').length;
  const auditScore = audits.length ? Math.round((completedAudits / audits.length) * 100) : 0;
  const visitorsCheckedIn = visitors.filter((v) => !v.checkOut).length;
  const lowStock = inventory.filter((i) => i.quantity <= i.minimumStock).length;
  const reportedCount = reports.filter((r) => r.status === 'reported').length;
  const investigatingCount = reports.filter((r) => r.status === 'investigating').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c0c1ff]" />
            Biosecurity Analytics & Disease Reports
          </h2>
          <p className="text-xs text-slate-400">Live disease surveillance and compliance summaries from your database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void loadReports()} className="px-3 py-2 rounded-xl border border-[#34343c] text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => openModal('pdf-export')} className="px-4 py-2.5 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#ba1a1a]/60 bg-[#ba1a1a]/10 p-4 text-sm text-[#ffb4ab]">
          <p className="font-semibold">Could not load report data</p>
          <p className="mt-1">{error}</p>
          <button onClick={() => void loadReports()} className="mt-2 underline">Try again</button>
        </div>
      )}

      <div className="surface-card rounded-2xl p-6 border border-[#34343c]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Audit completion score ${auditScore}%`}>
                <circle cx="50" cy="50" r="42" stroke="#292931" strokeWidth="10" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="#4CAF50" strokeWidth="10" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - auditScore / 100)} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 glow-green" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl text-white tracking-tight">{loading ? '…' : auditScore}</span>
                <span className="text-xs font-bold text-[#4CAF50] uppercase tracking-wider mt-0.5">Audit completion</span>
              </div>
            </div>
            <span className="mt-2 text-xs text-slate-400">Completed audits / all audits</span>
          </div>
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#316342]/40 text-[#4CAF50] text-xs font-bold border border-[#4CAF50]/40">
              <ShieldCheck className="w-4 h-4" /> Database-backed summary
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Farm Biosecurity Report</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              This page summarizes recorded disease reports, audit completion, visitor check-ins, and inventory stock. No lab/PCR result is inferred when no such data is stored.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#c0c1ff]" /><h4 className="text-sm font-bold text-white font-serif">Audit Compliance</h4></div>
            <span className="text-xs font-bold text-[#4CAF50]">{loading ? '…' : `${auditScore}%`}</span>
          </div>
          <p className="text-xs text-slate-300">{completedAudits} completed out of {audits.length} recorded audits.</p>
          <button onClick={() => openModal('pdf-export')} className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1">Export audit summary <ArrowUpRight className="w-3.5 h-3.5" /></button>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-[#4CAF50]" /><h4 className="text-sm font-bold text-white font-serif">Disease Surveillance</h4></div>
            <span className="text-xs font-bold text-[#ffba3f]">{loading ? '…' : `${reportedCount} reported`}</span>
          </div>
          <p className="text-xs text-slate-300">{investigatingCount} investigating · {resolvedCount} resolved · {reports.length} total disease reports.</p>
          <button onClick={() => openModal('add-disease-report')} className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1">Add disease report <ArrowUpRight className="w-3.5 h-3.5" /></button>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Users className="w-5 h-5 text-[#c0c1ff]" /><h4 className="text-sm font-bold text-white font-serif">Visitor Traceability</h4></div>
            <span className="text-xs font-bold text-white">{loading ? '…' : `${visitors.length} visitors`}</span>
          </div>
          <p className="text-xs text-slate-300">{visitorsCheckedIn} currently checked in, based on recorded checkout timestamps.</p>
          <button onClick={() => openModal('pdf-export')} className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1">Export visitor summary <ArrowUpRight className="w-3.5 h-3.5" /></button>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Package className="w-5 h-5 text-[#ffba3f]" /><h4 className="text-sm font-bold text-white font-serif">Inventory Stock</h4></div>
            <span className="text-xs font-bold text-[#ffba3f]">{loading ? '…' : `${lowStock} low stock`}</span>
          </div>
          <p className="text-xs text-slate-300">{inventory.length} tracked items. Low stock means quantity is at or below its configured minimum.</p>
          <button onClick={() => openModal('pdf-export')} className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1">Export inventory summary <ArrowUpRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <section className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-serif">Recent Disease Reports</h3>
          <span className="text-xs text-slate-400">{loading ? 'Loading…' : `${reports.length} records`}</span>
        </div>
        {loading ? <p className="text-xs text-slate-400">Loading reports from database…</p> :
          reports.length === 0 ? <p className="text-xs text-slate-400">No disease reports recorded yet.</p> :
          <div className="space-y-2">
            {reports.slice(0, 10).map((report) => (
              <div key={report.id} className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-white">{report.symptoms}</p>
                  <p className="text-xs text-slate-400 mt-1">{report.farmName} · {report.animalType} · {dateLabel(report.createdAt)}</p>
                  {report.description && <p className="text-xs text-slate-300 mt-1">{report.description}</p>}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] uppercase rounded-full px-2 py-1 bg-[#ffba3f]/15 text-[#ffba3f] border border-[#ffba3f]/30">{report.severity}</span>
                  <span className="text-[10px] uppercase rounded-full px-2 py-1 bg-[#1a178c]/30 text-[#c0c1ff] border border-[#c0c1ff]/30">{report.status}</span>
                </div>
              </div>
            ))}
          </div>
        }
      </section>
    </div>
  );
};
