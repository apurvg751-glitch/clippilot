'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { PlatformType, IdeaStage } from '@/types';
import { X, Lightbulb, Calendar, Sparkles, Check } from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function NewIdeaModal() {
  const { isIdeaModalOpen, setIsIdeaModalOpen, addContentIdea } = useStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    setTargetDate(d.toISOString().split('T')[0]);
  }, []);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [stage, setStage] = useState<IdeaStage>('idea');
  const [platforms, setPlatforms] = useState<PlatformType[]>(['youtube', 'tiktok']);

  if (!isIdeaModalOpen) return null;

  const togglePlatform = (p: PlatformType) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addContentIdea({
      title,
      notes: notes || 'Short-form vertical video hook idea.',
      targetPlatforms: platforms.length > 0 ? platforms : ['youtube'],
      stage,
      targetDate,
      priority,
    });

    setTitle('');
    setNotes('');
    setIsIdeaModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2842] flex items-center justify-between sticky top-0 bg-[#0f1422]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Capture Content Idea</h2>
              <p className="text-xs text-slate-400">Add to your creative pipeline & calendar</p>
            </div>
          </div>
          <button
            onClick={() => setIsIdeaModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Idea / Hook Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How I Batch 15 Shorts in 3 Hours"
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Script Notes / Hook Blueprint</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outline opening 3 seconds, key value delivery, and call to action..."
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Target Platforms */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">Target Platforms</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => togglePlatform('youtube')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  platforms.includes('youtube')
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-[#121829] border-[#212b45] text-slate-400'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Shorts</span>
              </button>
              <button
                type="button"
                onClick={() => togglePlatform('instagram')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  platforms.includes('instagram')
                    ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                    : 'bg-[#121829] border-[#212b45] text-slate-400'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Reels</span>
              </button>
              <button
                type="button"
                onClick={() => togglePlatform('tiktok')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  platforms.includes('tiktok')
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-[#121829] border-[#212b45] text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold">TT</span>
                <span>TikTok</span>
              </button>
            </div>
          </div>

          {/* Planned Date & Priority & Stage */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Planned Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Initial Pipeline Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="idea">Idea (Brainstorming)</option>
              <option value="scripting">Scripting</option>
              <option value="editing">Editing</option>
              <option value="ready">Ready to Publish</option>
            </select>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#1f2842] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsIdeaModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              Save Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
