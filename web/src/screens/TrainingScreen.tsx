import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const TrainingScreen: React.FC = () => {
  const { trainingTopics, openTrainingTopic } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Biosecurity', 'Animal Health', 'Hygiene', 'Emergency'];

  const filteredTopics = trainingTopics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeCategory === 'All') return matchesSearch;
    return matchesSearch && topic.category === activeCategory;
  });

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Title & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--lime)]" />
            Training, SOPs & Clinical Guidelines
          </h2>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
            Official biosecurity manuals, decontamination protocols & clinical field guidelines
          </p>
        </div>

        {/* Search Topics Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input
            type="text"
            placeholder="Search SOP or guideline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="fd-input w-full pl-9 pr-3 py-1.5 text-xs font-mono"
          />
        </div>
      </div>

      {/* 2. Category Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 rounded-[3px] bg-[var(--bg-panel)] border border-[var(--border)] overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-[2px] text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[var(--lime)] text-[#111311] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Featured Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => openTrainingTopic(topic)}
            className="fd-card fd-card-hover rounded-[3px] overflow-hidden border border-[var(--border)] cursor-pointer transition-all active:scale-[0.99] group flex flex-col justify-between"
          >
            {/* Topic Hero Image */}
            <div className="relative h-44 w-full overflow-hidden bg-[var(--bg-raised)] border-b border-[var(--border-dim)]">
              <img
                src={topic.image}
                alt={topic.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)] via-transparent to-transparent p-3 flex flex-col justify-between">
                <span className="self-end px-2 py-0.5 rounded-[2px] bg-[var(--bg-main)]/90 backdrop-blur-md text-[var(--lime)] text-[10px] font-mono font-bold border border-[var(--border)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--lime)]" /> {topic.readTime}
                </span>
                <span className="self-start px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--bg-panel)]/90 text-[var(--text-primary)] border border-[var(--border)]">
                  {topic.category}
                </span>
              </div>
            </div>

            {/* Topic Content Details */}
            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wide text-[var(--text-primary)] group-hover:text-[var(--lime)] transition-colors leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1 line-clamp-2 leading-relaxed">
                  {topic.summary}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-between text-xs font-mono font-bold text-[var(--lime)] uppercase tracking-wider">
                <span>Access Clinical SOP</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
