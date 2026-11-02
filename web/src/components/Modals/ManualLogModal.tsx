import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  ClipboardPen,
  Thermometer,
  Droplets,
  HeartPulse,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ManualLogModalProps {
  onSaved?: (newLog: any) => void;
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({ onSaved }) => {
  const { activeModal, closeModal, selectedFarmId, showToast } = useApp();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [temperature, setTemperature] = useState<string>('24.5');
  const [humidity, setHumidity] = useState<string>('60');
  const [animalCount, setAnimalCount] = useState<string>('2500');
  const [mortalityCount, setMortalityCount] = useState<string>('0');
  const [waterLiters, setWaterLiters] = useState<string>('420');
  const [feedKg, setFeedKg] = useState<string>('310');
  const [cleaningDone, setCleaningDone] = useState<boolean>(true);
  const [disinfectantUsed, setDisinfectantUsed] = useState<string>('Virkon-S 1% Footbath & Sprayer');
  const [observations, setObservations] = useState<string>('Normal active feeding behavior and clear respiration.');
  const [symptoms, setSymptoms] = useState<string>('None');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const isOpen = activeModal === 'manual-log';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) {
      setError('Please select or register a farm first.');
      return;
    }

    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);
    const animNum = parseInt(animalCount, 10);
    const mortNum = parseInt(mortalityCount, 10) || 0;
    const waterNum = parseFloat(waterLiters) || 0;
    const feedNum = parseFloat(feedKg) || 0;

    if (isNaN(tempNum) || tempNum < -10 || tempNum > 60) {
      setError('Please enter a valid barn temperature between -10°C and 60°C.');
      return;
    }
    if (isNaN(humNum) || humNum < 0 || humNum > 100) {
      setError('Please enter a valid relative humidity between 0% and 100%.');
      return;
    }
    if (isNaN(animNum) || animNum <= 0) {
      setError('Please enter a valid animal population count.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        farmId: selectedFarmId,
        logDate: date,
        temperature: tempNum,
        humidity: humNum,
        animalCount: animNum,
        mortalityCount: mortNum,
        waterConsumptionLiters: waterNum,
        feedConsumptionKg: feedNum,
        cleaningDisinfectionDone: cleaningDone,
        disinfectantUsed,
        healthObservations: observations,
        symptomsObserved: symptoms,
      };

      const res = await api.createDailyLog(payload);
      if (res?.success) {
        showToast('✅ Daily farm observation saved successfully to MongoDB!');
        if (onSaved) onSaved(res.data);
        closeModal();
      } else {
        throw new Error(res?.message || 'Failed to save daily log.');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not record daily observation. Please check login session.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-sm p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] sm:max-h-[92vh] overflow-y-auto"
        style={{
          background: 'var(--bg-panel)',
          border: '1.5px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-sm flex items-center justify-center"
              style={{ background: 'var(--lime-subtle)', border: '1px solid var(--lime-dim)' }}
            >
              <ClipboardPen className="w-5 h-5" style={{ color: 'var(--lime)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                  Record Daily Farm Observations
                </h2>
                <span className="fd-badge fd-badge-lime text-[10px]">100% NON-IoT</span>
              </div>
              <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                Physical thermometer, water meter & visual biosecurity inspections
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="fd-btn-icon text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-IoT Assurance Banner */}
        <div
          className="p-2.5 rounded-sm flex items-center gap-2 text-xs font-mono"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0 text-[var(--lime)]" />
          <span style={{ color: 'var(--text-secondary)' }}>
            No sensors or IoT hardware required. Enter your daily measurements manually below.
          </span>
        </div>

        {error && (
          <div
            className="p-3 text-xs rounded-sm flex items-center gap-2"
            style={{ background: 'var(--critical-bg)', border: '1px solid var(--critical-dim)', color: 'var(--critical)' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="fd-label block mb-1">Observation Date <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="fd-input w-full pl-8 font-mono text-xs"
                required
              />
              <Calendar className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Section 1: Temperature & Humidity Readings */}
          <div className="p-3 rounded-sm space-y-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <h4 className="text-xs font-bold uppercase font-mono flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Thermometer className="w-3.5 h-3.5 text-[var(--warning)]" /> Barn Climate (From Wall Thermometer & Hygrometer)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="fd-label block mb-1 text-[11px]">Barn Temperature (°C) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 24.5"
                  className="fd-input w-full font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-[var(--text-dim)] font-mono">Comfort range: 18°C - 28°C</span>
              </div>
              <div>
                <label className="fd-label block mb-1 text-[11px]">Relative Humidity (%) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="1"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  placeholder="e.g. 60"
                  className="fd-input w-full font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-[var(--text-dim)] font-mono">Target: 50% - 70%</span>
              </div>
            </div>
          </div>

          {/* Section 2: Population & Mortality */}
          <div className="p-3 rounded-sm space-y-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <h4 className="text-xs font-bold uppercase font-mono flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <HeartPulse className="w-3.5 h-3.5 text-[var(--critical)]" /> Herd / Flock Count & Mortality
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="fd-label block mb-1 text-[11px]">Active Population (Head) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={animalCount}
                  onChange={(e) => setAnimalCount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="fd-input w-full font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="fd-label block mb-1 text-[11px]">Mortality / Dead Birds or Animals Today</label>
                <input
                  type="number"
                  value={mortalityCount}
                  onChange={(e) => setMortalityCount(e.target.value)}
                  placeholder="e.g. 0"
                  className="fd-input w-full font-mono text-xs"
                />
                <span className="text-[10px] text-[var(--text-dim)] font-mono">Spikes &ge; 5 auto-trigger vet alert</span>
              </div>
            </div>
          </div>

          {/* Section 3: Water & Feed Meter Readings */}
          <div className="p-3 rounded-sm space-y-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <h4 className="text-xs font-bold uppercase font-mono flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Droplets className="w-3.5 h-3.5 text-[var(--lime)]" /> Feed & Water Usage
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="fd-label block mb-1 text-[11px]">Water Consumed Today (Liters) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="0.5"
                  value={waterLiters}
                  onChange={(e) => setWaterLiters(e.target.value)}
                  placeholder="e.g. 420"
                  className="fd-input w-full font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="fd-label block mb-1 text-[11px]">Feed Fed Today (Kg) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="0.5"
                  value={feedKg}
                  onChange={(e) => setFeedKg(e.target.value)}
                  placeholder="e.g. 310"
                  className="fd-input w-full font-mono text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cleaning, Disinfection & Observations */}
          <div className="p-3 rounded-sm space-y-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cleaning-checkbox"
                checked={cleaningDone}
                onChange={(e) => setCleaningDone(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--lime)] focus:ring-0"
              />
              <label htmlFor="cleaning-checkbox" className="text-xs font-bold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                Daily Shed Disinfection & Trench Spraying Performed
              </label>
            </div>
            <div>
              <label className="fd-label block mb-1 text-[11px]">Disinfectant Compound Applied</label>
              <input
                type="text"
                value={disinfectantUsed}
                onChange={(e) => setDisinfectantUsed(e.target.value)}
                placeholder="e.g. Virkon-S 1% / Chlorine Dip"
                className="fd-input w-full text-xs font-mono"
              />
            </div>
            <div>
              <label className="fd-label block mb-1 text-[11px]">Observed Clinical Signs / Symptoms</label>
              <select
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="fd-select w-full text-xs font-mono"
              >
                <option value="None">None (Healthy Active Herd)</option>
                <option value="Lethargy / Mild Inappetence">Lethargy / Mild Inappetence</option>
                <option value="Respiratory Wheezing / Rales">Respiratory Wheezing / Rales</option>
                <option value="Diarrhea / Wet Droppings">Diarrhea / Wet Droppings</option>
                <option value="Atypical Tremors / Locomotion">Atypical Tremors / Locomotion</option>
              </select>
            </div>
            <div>
              <label className="fd-label block mb-1 text-[11px]">Visual Observations & Remarks</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={2}
                placeholder="e.g. Animals active, clear eyes, good feed intake..."
                className="fd-input w-full text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost text-xs w-full sm:w-auto justify-center"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="fd-btn text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto"
              style={{ background: 'var(--lime)', color: '#111311', borderColor: 'var(--lime)' }}
            >
              {submitting ? (
                <>Saving to MongoDB...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Daily Observation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
