import { NextRequest, NextResponse } from 'next/server';
import { uploadYouTubeShort } from '@/lib/youtube';

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('yt_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        error: 'Not authenticated with YouTube',
        message: 'Please connect your YouTube channel via OAuth first.',
      },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const tagsRaw = (formData.get('tags') as string) || '';
    const file = formData.get('video') as File | null;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await uploadYouTubeShort(
      accessToken,
      {
        title,
        description,
        tags,
        privacyStatus: 'public',
      },
      buffer,
      file.type || 'video/mp4'
    );

    return NextResponse.json({
      success: true,
      video: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Failed to upload video to YouTube',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
