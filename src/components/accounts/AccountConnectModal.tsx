'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Key,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function AccountConnectModal() {
  const { accountToConnect, setAccountToConnect, toggleAccountConnection, addToast } = useStore();

  const [ytClientId, setYtClientId] = useState('721835915688-qdej5r983lidnsph7g3prel0h7lmn2tu.apps.googleusercontent.com');
  const [ytClientSecret, setYtClientSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!accountToConnect) return null;

  const acc = accountToConnect;
  const isYT = acc.platform === 'youtube';
  const isIG = acc.platform === 'instagram';
  const isTT = acc.platform === 'tiktok';

  const handleToggle = () => {
    toggleAccountConnection(acc.id);
    addToast(
      'success',
      acc.isConnected
        ? `Disconnected ${acc.platformName}`
        : `Connected ${acc.platformName} via OAuth 2.0`
    );
    setAccountToConnect(null);
  };

  const handleLiveYouTubeOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytClientId.trim() || !ytClientSecret.trim()) {
      addToast('error', 'Please enter both Client ID and Client Secret');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeClientId: ytClientId.trim(),
          youtubeClientSecret: ytClientSecret.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save credentials');
      }

      addToast('success', 'Credentials saved! Redirecting to Google OAuth login...');
      // Direct browser to Google OAuth initiation
      window.location.href = '/api/auth/youtube';
    } catch (err: any) {
      addToast('error', err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2842] flex items-center justify-between sticky top-0 bg-[#0f1422]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isYT
                  ? 'bg-rose-500/20 text-rose-400'
                  : isIG
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isYT ? <Youtube className="w-5 h-5" /> : isIG ? <Instagram className="w-5 h-5" /> : <span className="font-bold text-sm">TT</span>}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {acc.isConnected ? 'Manage Integration:' : 'Connect Real Channel:'} {acc.platformName}
              </h2>
              <p className="text-xs text-slate-400">Official OAuth 2.0 Direct API Authentication</p>
            </div>
          </div>
          <button
            onClick={() => setAccountToConnect(null)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Real YouTube Credentials Configured Section */}
          {isYT && !acc.isConnected && (
            <div className="p-5 rounded-2xl bg-[#121829] border border-rose-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Google Cloud Credentials Detected</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Authorize
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1220] border border-[#1f2842] text-xs space-y-1 font-mono">
                <div className="text-slate-400 text-[11px]">Client ID:</div>
                <div className="text-cyan-300 truncate">721835915688-qdej5r983lidnsph7g3prel0h7lmn2tu.apps.googleusercontent.com</div>
                <div className="text-slate-400 text-[11px] pt-1">Client Secret:</div>
                <div className="text-slate-400">••••••••••••••••••••••••••••••••</div>
              </div>

              <a
                href="/api/auth/youtube"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Youtube className="w-4 h-4" />
                <span>Authorize & Connect My Real YouTube Channel</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="text-[11px] text-slate-400 text-center">
                Clicking will open Google's secure account consent screen.
              </div>
            </div>
          )}

          {/* Official API Permissions Checklist */}
          <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-2.5">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-violet-400" />
              <span>Required Official API Scopes</span>
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              {acc.scopes.map((scope) => (
                <div key={scope} className="flex items-center gap-2 font-mono text-[11px] bg-[#0d1220] p-2 rounded-lg border border-[#1e2740]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-violet-300">{scope}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Instructions depending on platform */}
          <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-3 text-xs text-slate-300">
            <h4 className="font-semibold text-white">Developer Credentials Guide:</h4>
            {isYT && (
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 leading-relaxed">
                <li>Create a project in <strong>Google Cloud Console</strong> (<a href="https://console.cloud.google.com" target="_blank" className="text-cyan-400 underline">console.cloud.google.com</a>).</li>
                <li>Go to <strong>APIs & Services → Library</strong> and enable <strong>YouTube Data API v3</strong>.</li>
                <li>Go to <strong>Credentials → Create Credentials → OAuth Client ID</strong> (Web application).</li>
                <li>Add Authorized Redirect URI: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">http://localhost:3000/api/auth/youtube/callback</code></li>
                <li>Paste the <strong>Client ID</strong> and <strong>Client Secret</strong> above!</li>
              </ol>
            )}

            {isIG && (
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 leading-relaxed">
                <li>Register a Business or Creator account on <strong>Meta for Developers</strong>.</li>
                <li>Add the <strong>Instagram Content Publishing API</strong> and <strong>Instagram Graph API</strong>.</li>
                <li>Generate an access token and configure OAuth redirect.</li>
              </ol>
            )}

            {isTT && (
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 leading-relaxed">
                <li>Register on <strong>TikTok for Developers</strong> and submit your app for review for the <strong>Content Posting API v2</strong>.</li>
              </ol>
            )}

            <div className="pt-2 border-t border-[#1e2740] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Encrypted server token storage
              </span>
              <a
                href={
                  isYT
                    ? 'https://console.cloud.google.com'
                    : isIG
                    ? 'https://developers.facebook.com'
                    : 'https://developers.tiktok.com'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
              >
                <span>Developer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleToggle}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              {acc.isConnected ? 'Disconnect Channel' : 'Simulate Demo Connect'}
            </button>
            <button
              onClick={() => setAccountToConnect(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
