import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('file');

  if (!filePath) {
    return new NextResponse('File path is required', { status: 400 });
  }

  // Security check: ensure file is inside Mani Clips or Scratch
  const normalized = path.normalize(filePath);
  const allowedBase1 = path.normalize(
    path.join(process.env.USERPROFILE || 'C:\\Users\\admin', 'Documents', 'Mani Clips')
  );

  if (!normalized.startsWith(allowedBase1) && !normalized.includes('Mani Clips')) {
    return new NextResponse('Access denied: File outside permitted directories', { status: 403 });
  }

  if (!fs.existsSync(normalized)) {
    return new NextResponse('Video file not found', { status: 404 });
  }

  const stat = fs.statSync(normalized);
  const fileSize = stat.size;
  const range = req.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(normalized, { start, end });

    return new NextResponse(fileStream as any, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
      },
    });
  } else {
    const fileStream = fs.createReadStream(normalized);
    return new NextResponse(fileStream as any, {
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
      },
    });
  }
}
