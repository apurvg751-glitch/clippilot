import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = util.promisify(execFile);

function getManiBinary(name: string): string {
  const parts = ['D:', 'Mani Clips', 'binaries', name];
  return parts.join(path.sep);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, clipLength = 30 } = body;

    if (!url || typeof url !== 'string' || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)',
        },
        { status: 400 }
      );
    }

    const ytdlpPath = getManiBinary('yt-dlp-real.exe');
    const ffmpegPath = getManiBinary('ffmpeg-real.exe');

    if (!fs.existsSync(ytdlpPath) || !fs.existsSync(ffmpegPath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mani Clips binaries not found in D:\\Mani Clips\\binaries.',
        },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const outputDir = path.resolve(process.cwd(), 'data', 'rendered_shorts', `clip_${timestamp}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const rawVideoPath = path.join(outputDir, 'raw.mp4');
    const finalShortPath = path.join(outputDir, 'short_vertical.mp4');

    // 1. Get YouTube Video Title
    let videoTitle = 'Gaming Viral Short';
    try {
      const { stdout: titleOut } = await execFileAsync(ytdlpPath, ['--get-title', '--no-warnings', url]);
      if (titleOut && titleOut.trim()) {
        videoTitle = titleOut.trim().split('\n')[0];
      }
    } catch {
      // Use fallback title
    }

    // 2. Download the clip snippet (0 to clipLength seconds)
    const durationStr = `*00:00-00:${String(clipLength).padStart(2, '0')}`;
    await execFileAsync(ytdlpPath, [
      '--download-sections',
      durationStr,
      '-f',
      'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
      '--no-warnings',
      '--force-overwrites',
      url,
      '-o',
      rawVideoPath,
    ]);

    if (!fs.existsSync(rawVideoPath)) {
      throw new Error('Failed to download video stream from YouTube.');
    }

    // 3. Render 9:16 vertical video with Mani Clips blurred background canvas using FFmpeg
    const filterComplex =
      '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2';

    await execFileAsync(ffmpegPath, [
      '-i',
      rawVideoPath,
      '-filter_complex',
      filterComplex,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-c:a',
      'aac',
      finalShortPath,
      '-y',
    ]);

    if (!fs.existsSync(finalShortPath)) {
      throw new Error('FFmpeg failed to render vertical 9:16 video.');
    }

    const stat = fs.statSync(finalShortPath);
    const sizeMb = Number((stat.size / (1024 * 1024)).toFixed(1));

    return NextResponse.json({
      success: true,
      title: videoTitle,
      clipId: `clip_${timestamp}`,
      videoPath: finalShortPath,
      streamUrl: `/api/clipper/stream?file=${encodeURIComponent(finalShortPath)}`,
      downloadUrl: `/api/clipper/download?file=${encodeURIComponent(finalShortPath)}&name=${encodeURIComponent(videoTitle + '.mp4')}`,
      durationSeconds: clipLength,
      fileSizeMb: sizeMb,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Video processing failed.',
      },
      { status: 500 }
    );
  }
}
