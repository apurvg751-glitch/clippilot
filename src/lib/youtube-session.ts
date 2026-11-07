import fs from 'fs';
import path from 'path';
import { refreshAccessToken, getMyChannelData } from './youtube';

export interface YouTubeSessionData {
  connected: boolean;
  channelId?: string;
  title?: string;
  handle?: string;
  avatarUrl?: string;
  subscribersCount?: number;
  totalViews?: number;
  videoCount?: number;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
  lastSync?: string;
  lastVerified?: string;
  connectedAt?: string;
}

function getSessionFilePath(): string {
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.resolve(dataDir, 'youtube_session.json');
}

export function readStoredSession(): YouTubeSessionData | null {
  try {
    const filePath = getSessionFilePath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read stored YouTube session:', err);
    return null;
  }
}

export function writeStoredSession(data: Partial<YouTubeSessionData>): YouTubeSessionData {
  const filePath = getSessionFilePath();
  const existing = readStoredSession() || {
    connected: true,
    channelId: 'UC_apurvg-p9m',
    title: 'MASTERDOM',
    handle: '@apurvg-p9m',
    subscribersCount: 0,
    totalViews: 0,
    videoCount: 0,
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  };

  const updated: YouTubeSessionData = {
    ...existing,
    ...data,
    lastSync: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write stored YouTube session:', err);
  }
  return updated;
}

export async function getActiveYouTubeToken(): Promise<string | null> {
  const session = readStoredSession();
  if (!session) return null;

  // If token is still valid (with 60s buffer), use it
  if (session.accessToken && session.expiresAt && session.expiresAt > Date.now() + 60000) {
    return session.accessToken;
  }

  // If we have a refresh token, refresh it
  if (session.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(session.refreshToken);
      const newAccessToken = refreshed.access_token;
      const expiresIn = refreshed.expires_in || 3600;
      const newExpiresAt = Date.now() + expiresIn * 1000;

      writeStoredSession({
        accessToken: newAccessToken,
        expiresAt: newExpiresAt,
        connected: true,
      });

      return newAccessToken;
    } catch (err: any) {
      console.warn('Failed to refresh YouTube access token:', err.message);
    }
  }

  return session.accessToken || null;
}
