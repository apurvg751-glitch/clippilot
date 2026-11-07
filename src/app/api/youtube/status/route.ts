import { NextRequest, NextResponse } from 'next/server';
import { getMyChannelData } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const isConfigured = Boolean(
    process.env.YOUTUBE_CLIENT_ID &&
    process.env.YOUTUBE_CLIENT_SECRET &&
    !process.env.YOUTUBE_CLIENT_ID.includes('placeholder')
  );

  const accessToken = req.cookies.get('yt_access_token')?.value;
  const cachedChannelCookie = req.cookies.get('yt_channel_info')?.value;

  let channelData = null;
  if (cachedChannelCookie) {
    try {
      channelData = JSON.parse(cachedChannelCookie);
    } catch {
      // Ignore JSON parse errors
    }
  }

  // If we have an active access token, fetch real fresh data from YouTube API
  if (accessToken) {
    try {
      const freshChannel = await getMyChannelData(accessToken);
      channelData = freshChannel;
    } catch (err: any) {
      // Token might be expired
      console.warn('Could not refresh YouTube channel:', err.message);
    }
  }

  return NextResponse.json({
    configured: isConfigured,
    connected: Boolean(channelData || accessToken),
    channel: channelData,
  });
}
