// Server-side YouTube Data API v3 & OAuth 2.0 Client

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export function getYouTubeAuthUrl(redirectUri: string) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) {
    throw new Error('YOUTUBE_CLIENT_ID environment variable is missing.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('YouTube OAuth credentials missing in .env.local');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to exchange code: ${errorText}`);
  }

  return await res.json();
}

export async function getMyChannelData(accessToken: string) {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`YouTube API error: ${errorText}`);
  }

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) {
    throw new Error('No YouTube channel found for this Google account.');
  }

  return {
    channelId: item.id,
    title: item.snippet.title,
    handle: item.snippet.customUrl || `@${item.snippet.title.replace(/\s+/g, '')}`,
    avatarUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    subscribersCount: Number(item.statistics.subscriberCount) || 0,
    totalViews: Number(item.statistics.viewCount) || 0,
    videoCount: Number(item.statistics.videoCount) || 0,
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,
  };
}

export async function getChannelVideos(accessToken: string, uploadsPlaylistId: string) {
  // 1. Fetch playlist items
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=15`;
  const playlistRes = await fetch(playlistUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!playlistRes.ok) return [];

  const playlistData = await playlistRes.json();
  const videoIds = playlistData.items?.map((item: any) => item.contentDetails.videoId) || [];
  if (videoIds.length === 0) return [];

  // 2. Fetch statistics for these videos
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}`;
  const statsRes = await fetch(statsUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!statsRes.ok) return [];

  const statsData = await statsRes.json();
  return (statsData.items || []).map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    thumbnailUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
    publishedAt: v.snippet.publishedAt,
    views: Number(v.statistics.viewCount) || 0,
    likes: Number(v.statistics.likeCount) || 0,
    comments: Number(v.statistics.commentCount) || 0,
    duration: v.contentDetails.duration,
    url: `https://youtube.com/shorts/${v.id}`,
  }));
}

export async function uploadYouTubeShort(
  accessToken: string,
  metadata: {
    title: string;
    description: string;
    tags?: string[];
    privacyStatus?: 'public' | 'unlisted' | 'private';
  },
  videoBuffer: Buffer,
  mimeType: string = 'video/mp4'
) {
  // Ensure #Shorts is present in title or description as required by YouTube
  let finalTitle = metadata.title;
  if (!finalTitle.includes('#Shorts')) {
    finalTitle = `${finalTitle} #Shorts`;
  }

  // 1. Initiate resumable upload session
  const initUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';
  const initRes = await fetch(initUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
      'X-Upload-Content-Length': String(videoBuffer.length),
    },
    body: JSON.stringify({
      snippet: {
        title: finalTitle,
        description: metadata.description,
        tags: metadata.tags || ['Shorts', 'ClipPilot'],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: metadata.privacyStatus || 'public',
        selfDeclaredMadeForKids: false,
      },
    }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Could not initiate upload: ${errText}`);
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Upload session location header missing.');
  }

  // 2. Transfer the video bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(videoBuffer.length),
    },
    body: videoBuffer as unknown as BodyInit,
  });

  if (!uploadRes.ok) {
    const uploadErr = await uploadRes.text();
    throw new Error(`Upload failed during binary transfer: ${uploadErr}`);
  }

  const result = await uploadRes.json();
  return {
    videoId: result.id,
    videoUrl: `https://youtube.com/shorts/${result.id}`,
    title: result.snippet?.title,
    status: result.status?.privacyStatus,
  };
}
