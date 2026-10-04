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
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Title & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c0c1ff]" />
            Training, SOPs & Clinical Guidelines
          </h2>
          <p className="text-xs text-slate-400">
            Official biosecurity decontamination manuals, footbath protocols, and hygiene standards
          </p>
        </div>

        {/* Search Topics Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SOP or hygiene topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 text-xs focus:border-[#c0c1ff] outline-none"
          />
        </div>
      </div>

      {/* 2. Category Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#1a178c] text-[#c0c1ff] shadow-md'
                : 'text-slate-400 hover:text-white'
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
            className="surface-card rounded-2xl overflow-hidden border border-[#34343c] hover:border-[#c0c1ff]/60 cursor-pointer transition-all active:scale-98 group flex flex-col justify-between shadow-lg"
          >
            {/* Topic Hero Image */}
            <div className="relative h-44 w-full overflow-hidden bg-[#1f1f26]">
              <img
                src={topic.image}
                alt={topic.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b22] via-transparent to-transparent p-3 flex items-between justify-between flex-col">
                <span className="self-end px-2.5 py-1 rounded-full bg-[#12131a]/80 backdrop-blur-md text-[#c0c1ff] text-[10px] font-bold border border-[#c0c1ff]/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#c0c1ff]" /> {topic.readTime}
                </span>
                <span className="self-start px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#1a178c] text-[#c0c1ff]">
                  {topic.category}
                </span>
              </div>
            </div>

            {/* Topic Content Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-white group-hover:text-[#c0c1ff] transition-colors leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1 line-clamp-2">
                  {topic.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#34343c] flex items-center justify-between text-xs font-bold text-[#c0c1ff]">
                <span>Read Full Clinical SOP Guidelines</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
