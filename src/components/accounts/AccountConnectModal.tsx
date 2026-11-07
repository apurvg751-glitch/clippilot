'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  ShieldCheck,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Key,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function AccountConnectModal() {
  const { accountToConnect, setAccountToConnect, toggleAccountConnection, addToast } = useStore();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
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
                {acc.isConnected ? 'Manage Integration:' : 'Connect Official Channel:'} {acc.platformName}
              </h2>
              <p className="text-xs text-slate-400">OAuth 2.0 Security & Scope Authorization</p>
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
                <li>Create a project in <strong>Google Cloud Console</strong>.</li>
                <li>Enable <strong>YouTube Data API v3</strong> and <strong>YouTube Analytics API</strong>.</li>
                <li>Create an OAuth 2.0 Client ID for Web Application.</li>
                <li>Set Authorized Redirect URI to: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">http://localhost:3000/api/auth/youtube/callback</code></li>
                <li>Add <code className="text-violet-300 font-mono">YOUTUBE_CLIENT_ID</code> and <code className="text-violet-300 font-mono">YOUTUBE_CLIENT_SECRET</code> to your <code className="font-mono">.env.local</code>.</li>
              </ol>
            )}

            {isIG && (
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 leading-relaxed">
                <li>Register a Business or Creator account on <strong>Meta for Developers</strong>.</li>
                <li>Add the <strong>Instagram Content Publishing API</strong> and <strong>Instagram Graph API</strong> products.</li>
                <li>Generate a long-lived User Access Token or configure OAuth redirect.</li>
                <li>Add <code className="text-pink-300 font-mono">INSTAGRAM_APP_ID</code> and <code className="text-pink-300 font-mono">INSTAGRAM_APP_SECRET</code> to your <code className="font-mono">.env.local</code>.</li>
              </ol>
            )}

            {isTT && (
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 leading-relaxed">
                <li>Apply for an account on the <strong>TikTok for Developers</strong> portal.</li>
                <li>Create an App and request access to the <strong>Content Posting API v2</strong>.</li>
                <li>TikTok requires business verification and developer app review before granting production video upload access.</li>
                <li>Add <code className="text-cyan-300 font-mono">TIKTOK_CLIENT_KEY</code> and <code className="text-cyan-300 font-mono">TIKTOK_CLIENT_SECRET</code>.</li>
              </ol>
            )}

            <div className="pt-2 border-t border-[#1e2740] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No passwords stored or requested
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
                <span>Open Developer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Toggle Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={() => setAccountToConnect(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleToggle}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                acc.isConnected
                  ? 'bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/25'
              }`}
            >
              {acc.isConnected ? 'Disconnect Channel' : 'Authorize & Connect OAuth'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
