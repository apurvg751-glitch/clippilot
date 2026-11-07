'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  Share,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { addToast } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'phone'>('desktop');
  const [copied, setCopied] = useState(false);

  // Local WiFi IP address
  const localNetworkUrl = 'http://192.168.31.93:3000';

  useEffect(() => {
    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      addToast('success', 'ClipPilot was installed successfully on your device!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [addToast]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        addToast('success', 'ClipPilot installation accepted!');
      }
      setDeferredPrompt(null);
    } else {
      addToast(
        'info',
        'In your browser address bar, click the "Install App" button (or 3-dots menu → "Install ClipPilot").'
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(localNetworkUrl);
    setCopied(true);
    addToast('success', 'Local phone link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2842] flex items-center justify-between sticky top-0 bg-[#0f1422]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-[#0f1422] rounded-[14px] flex items-center justify-center">
                <Download className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Install ClipPilot</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PC & Mobile
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Run ClipPilot as a standalone native app on your computer or phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#121829] border border-[#1f2842]">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'desktop'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Computer (Windows / Mac)</span>
            </button>
            <button
              onClick={() => setActiveTab('phone')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'phone'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Phone (Android / iPhone)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ClipPilot is already installed on this device! You can launch it directly from your Desktop, Taskbar, or App drawer.
              </span>
            </div>
          )}

          {/* Desktop Install Instructions */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Laptop className="w-4 h-4 text-violet-400" />
                    <span>Method 1: 1-Click Desktop PWA Install</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase">Recommended</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Installs ClipPilot as a standalone desktop window on your PC with a custom app icon on your Windows Taskbar and Desktop.
                </p>
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Install ClipPilot on This Computer</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Method 2: Standalone Windows App Launcher</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  We have placed a dedicated launcher script in the project directory:
                </p>
                <div className="p-2.5 rounded-xl bg-[#0d1220] border border-[#1e2740] font-mono text-[11px] text-violet-300">
                  C:\Users\admin\.gemini\antigravity\scratch\clippilot\Launch-ClipPilot.bat
                </div>
                <p className="text-[11px] text-slate-400">
                  Double-clicking this file launches ClipPilot directly in clean window mode (no browser address bar, hardware accelerated).
                </p>
              </div>
            </div>
          )}

          {/* Phone Install Instructions */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Your Local Phone Network URL</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Same Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0d1220] border border-[#1e2740]">
                  <input
                    type="text"
                    readOnly
                    value={localNetworkUrl}
                    className="flex-1 bg-transparent text-xs font-mono text-cyan-300 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-[#19223c] hover:bg-[#222f52] text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Step by step for iOS and Android */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Android */}
                <div className="p-3.5 rounded-2xl bg-[#121829] border border-[#212b45] space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Android (Chrome / Edge)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                    <li>Connect phone to same Wi-Fi.</li>
                    <li>Open <code className="text-cyan-300 font-mono">192.168.31.93:3000</code> in Chrome.</li>
                    <li>Tap the <strong>"Install App"</strong> pop-up banner or open Chrome menu (<span className="text-white">⋮</span>) and tap <strong>"Install app"</strong>.</li>
                    <li>ClipPilot is now an app on your home screen!</li>
                  </ol>
                </div>

                {/* iPhone */}
                <div className="p-3.5 rounded-2xl bg-[#121829] border border-[#212b45] space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>iPhone (Apple Safari)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                    <li>Connect iPhone to same Wi-Fi.</li>
                    <li>Open <code className="text-cyan-300 font-mono">192.168.31.93:3000</code> in Safari.</li>
                    <li>Tap the <strong>Share</strong> icon (<span className="text-white">⬆</span>) at the bottom.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top-right corner!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-[#1f2842] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full offline support & local cache enabled</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
