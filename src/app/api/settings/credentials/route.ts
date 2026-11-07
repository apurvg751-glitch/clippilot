import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { youtubeClientId, youtubeClientSecret } = await req.json();

    if (!youtubeClientId || !youtubeClientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required.' },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), '.env.local');
    let currentContent = '';
    if (fs.existsSync(envPath)) {
      currentContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Helper to replace or append env vars
    const updateEnv = (content: string, key: string, val: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${val}`);
      }
      return `${content.trim()}\n${key}=${val}\n`;
    };

    let updated = updateEnv(currentContent, 'YOUTUBE_CLIENT_ID', youtubeClientId.trim());
    updated = updateEnv(updated, 'YOUTUBE_CLIENT_SECRET', youtubeClientSecret.trim());
    updated = updateEnv(
      updated,
      'YOUTUBE_REDIRECT_URI',
      'http://localhost:3000/api/auth/youtube/callback'
    );

    fs.writeFileSync(envPath, updated, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'YouTube credentials saved to .env.local successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to save credentials', message: err.message },
      { status: 500 }
    );
  }
}
