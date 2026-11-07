import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeAuthUrl } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${origin}/api/auth/youtube/callback`;

  try {
    const authUrl = getYouTubeAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'YouTube API configuration error',
        message: err.message,
        hint: 'Please provide YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env.local',
      },
      { status: 400 }
    );
  }
}
