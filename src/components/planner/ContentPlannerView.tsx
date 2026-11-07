'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ContentIdea, IdeaStage, PlatformType } from '@/types';
import {
  CalendarDays,
  Plus,
  Kanban,
  Calendar as CalendarIcon,
  Lightbulb,
  Edit3,
  CheckCircle2,
  Trash2,
  Send,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

const STAGES: { id: IdeaStage; label: string; color: string; border: string }[] = [
  { id: 'idea', label: 'Idea Backlog', color: 'bg-indigo-500/10 text-indigo-300', border: 'border-indigo-500/30' },
  { id: 'scripting', label: 'Scripting / Hook', color: 'bg-amber-500/10 text-amber-300', border: 'border-amber-500/30' },
  { id: 'editing', label: 'In Production / Edit', color: 'bg-violet-500/10 text-violet-300', border: 'border-violet-500/30' },
  { id: 'ready', label: 'Ready to Publish', color: 'bg-cyan-500/10 text-cyan-300', border: 'border-cyan-500/30' },
  { id: 'published', label: 'Published / Live', color: 'bg-emerald-500/10 text-emerald-300', border: 'border-emerald-500/30' },
];

export function ContentPlannerView() {
  const { ideas, updateIdeaStage, deleteIdea, setIsIdeaModalOpen, setActiveTab } = useStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');

  // Next stage progression map
  const nextStage: Record<IdeaStage, IdeaStage | null> = {
    idea: 'scripting',
    scripting: 'editing',
    editing: 'ready',
    ready: 'published',
    published: null,
  };

  // Calendar generation for current month
  const [currentDate, setCurrentDate] = useState(() => new Date('2026-11-01T00:00:00Z'));
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-violet-400" />
            <span>Short-Form Content Planner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Map video hooks, schedule calendar drops, and move concepts through Idea → Scripting → Editing → Ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-[#121829] p-1 rounded-xl border border-[#212b45]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsIdeaModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Concept</span>
          </button>
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((col) => {
            const columnIdeas = ideas.filter((i) => i.stage === col.id);

            return (
              <div
                key={col.id}
                className="rounded-2xl bg-[#0e1322] border border-[#1b253e] p-3.5 flex flex-col min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1b253e]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.color} ${col.border}`}
                  >
                    {columnIdeas.length}
                  </span>
                </div>

                {/* Ideas Cards Stack */}
                <div className="space-y-3 flex-1">
                  {columnIdeas.map((idea) => {
                    const next = nextStage[idea.stage];

                    return (
                      <div
                        key={idea.id}
                        className="p-3.5 rounded-xl bg-[#131a2e] border border-[#202b48] hover:border-violet-500/40 transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                            {idea.title}
                          </h4>
                          <button
                            onClick={() => deleteIdea(idea.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {idea.notes}
                        </p>

                        {/* Planned Date & Target Platforms */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#1b243d] text-[10px] text-slate-400">
                          {idea.targetDate ? (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {idea.targetDate.slice(5)}
                            </span>
                          ) : (
                            <span>Unscheduled</span>
                          )}

                          <div className="flex items-center gap-1">
                            {idea.targetPlatforms.includes('youtube') && (
                              <Youtube className="w-3 h-3 text-rose-400" />
                            )}
                            {idea.targetPlatforms.includes('instagram') && (
                              <Instagram className="w-3 h-3 text-pink-400" />
                            )}
                            {idea.targetPlatforms.includes('tiktok') && (
                              <span className="text-[9px] font-bold text-cyan-400">TT</span>
                            )}
                          </div>
                        </div>

                        {/* Progression Action */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          {idea.stage === 'ready' ? (
                            <button
                              onClick={() => setActiveTab('publishing')}
                              className="w-full py-1 px-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Go to Publisher</span>
                            </button>
                          ) : next ? (
                            <button
                              onClick={() => updateIdeaStage(idea.id, next)}
                              className="w-full py-1 px-2 rounded-lg bg-[#19223c] hover:bg-violet-600/25 text-slate-300 hover:text-violet-200 border border-[#263354] hover:border-violet-500/40 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Move to {next.toUpperCase()}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mx-auto font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {columnIdeas.length === 0 && (
                    <div className="py-8 text-center text-slate-600 text-[11px] border border-dashed border-[#1e2740] rounded-xl">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-violet-400" />
              <span>
                {monthNames[currentMonth]} {currentYear}
              </span>
            </h3>
            <span className="text-xs text-slate-400">
              {ideas.filter((i) => Boolean(i.targetDate)).length} scheduled content drops
            </span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-400 uppercase py-2 border-b border-[#1f2842]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div
                key={`empty_${idx}`}
                className="h-28 rounded-xl bg-[#0c101c]/40 border border-transparent"
              />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const dayIdeas = ideas.filter((i) => i.targetDate === dateString);
              const isToday = dayNum === currentDate.getDate();

              return (
                <div
                  key={`day_${dayNum}`}
                  className={`h-28 rounded-xl p-2 border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-violet-950/20 border-violet-500/50 shadow-md'
                      : 'bg-[#101627] border-[#1d2742] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'text-violet-400' : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayIdeas.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>

                  {/* Day Content Badges */}
                  <div className="space-y-1 overflow-y-auto max-h-16">
                    {dayIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="px-1.5 py-0.5 rounded bg-violet-600/30 border border-violet-500/40 text-[10px] text-violet-200 truncate font-medium cursor-pointer hover:bg-violet-600/50"
                        title={idea.title}
                        onClick={() => {
                          if (idea.stage === 'ready') setActiveTab('publishing');
                        }}
                      >
                        {idea.title}
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] text-slate-500 text-right">
                    {dayIdeas.length > 0 ? `${dayIdeas.length} idea(s)` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
