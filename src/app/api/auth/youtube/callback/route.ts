import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getMyChannelData } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const origin = req.nextUrl.origin;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${origin}/api/auth/youtube/callback`;

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code_provided`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const channel = await getMyChannelData(tokens.access_token);

    // Redirect to dashboard with success query parameter
    const response = NextResponse.redirect(
      `${origin}/?tab=accounts&connected=youtube&handle=${encodeURIComponent(
        channel.handle
      )}&title=${encodeURIComponent(channel.title)}&subs=${channel.subscribersCount}&views=${channel.totalViews}`
    );

    // Save tokens in secure HTTP-only cookies
    response.cookies.set('yt_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600,
      path: '/',
    });

    if (tokens.refresh_token) {
      response.cookies.set('yt_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    // Also store channel info for client consumption
    response.cookies.set(
      'yt_channel_info',
      JSON.stringify({
        channelId: channel.channelId,
        title: channel.title,
        handle: channel.handle,
        avatarUrl: channel.avatarUrl,
        subscribersCount: channel.subscribersCount,
        totalViews: channel.totalViews,
        lastSync: new Date().toISOString(),
      }),
      {
        httpOnly: false, // client readable
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      }
    );

    return response;
  } catch (err: any) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(err.message)}`);
  }
}
