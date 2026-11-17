import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('file');
  const filename = searchParams.get('name') || 'short_clip.mp4';

  if (!filePath) {
    return new NextResponse('File parameter required', { status: 400 });
  }

  const normalized = path.normalize(filePath);
  const allowedBases = [
    path.normalize(path.resolve(process.cwd(), 'data', 'rendered_shorts')),
    path.normalize('D:\\Mani Clips Projects'),
    path.normalize(path.join(process.env.USERPROFILE || 'C:\\Users\\admin', 'Documents', 'Mani Clips')),
    path.normalize('D:\\apurv\\clipping'),
    path.normalize('D:\\Mani Clips'),
  ];

  const isAllowed = allowedBases.some((base) => normalized.toLowerCase().startsWith(base.toLowerCase()));
  if (!isAllowed) {
    return new NextResponse('Access denied', { status: 403 });
  }

  if (!fs.existsSync(normalized)) {
    return new NextResponse('Video file not found', { status: 404 });
  }

  const fileStream = fs.createReadStream(normalized);
  const stat = fs.statSync(normalized);

  return new NextResponse(fileStream as any, {
    headers: {
      'Content-Length': stat.size.toString(),
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
