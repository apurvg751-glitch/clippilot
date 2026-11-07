'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  Search,
  Plus,
  Lightbulb,
  FileDown,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Download,
} from 'lucide-react';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    isDemoMode,
    toggleDemoMode,
    setIsUploadModalOpen,
    setIsIdeaModalOpen,
    setIsInstallModalOpen,
    exportDataToCSV,
  } = useStore();

  return (
    <header className="h-16 px-6 bg-[#0c101c]/90 backdrop-blur-md border-b border-[#1a233a] flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-80 max-w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clips, captions, tags..."
          className="w-full bg-[#111728] border border-[#1e2842] focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Install Native App Button */}
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-violet-950/60 hover:from-cyan-900/60 hover:to-violet-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold shadow-md shadow-cyan-950/20 transition-all hover:scale-[1.02]"
          title="Install ClipPilot as an App on Computer or Phone"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Install App</span>
        </button>

        {/* Demo Mode Toggle */}
        <button
          onClick={toggleDemoMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isDemoMode
              ? 'bg-violet-950/40 border-violet-500/40 text-violet-300 hover:bg-violet-900/40'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle between realistic sample data and live connected accounts"
        >
          {isDemoMode ? (
            <ToggleRight className="w-4 h-4 text-violet-400" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-slate-500" />
          )}
          <span>Demo Data {isDemoMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Quick CSV Export */}
        <button
          onClick={() => exportDataToCSV('videos')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111728] hover:bg-[#18213a] border border-[#1e2842] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          title="Export Video Performance Data as CSV"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>

        {/* Add Idea Button */}
        <button
          onClick={() => setIsIdeaModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 text-xs font-medium text-indigo-300 hover:text-white transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          <span>New Idea</span>
        </button>

        {/* Upload Clip Primary Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Clip</span>
        </button>

        {/* Creator Profile Chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#1a233a]">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0c101c] rounded-full" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <span>Alex Rivera</span>
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[10px] text-slate-400">Creator Studio</div>
          </div>
        </div>
      </div>
    </header>
  );
}
