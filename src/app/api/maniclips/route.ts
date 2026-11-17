import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface ManiClipEntry {
  id: string;
  projectId: string;
  projectName: string;
  videoTitle: string;
  clipIndex: number;
  fileName: string;
  absolutePath: string;
  baseAbsolutePath?: string;
  streamUrl: string;
  downloadUrl: string;
  fileSizeMb: number;
  durationSec: number;
  hotScore: number;
  captionStyle: string;
  captions: Array<{ startSec: number; endSec: number; text: string }>;
}

export interface ManiProject {
  id: string;
  name: string;
  videoTitle: string;
  folderPath: string;
  createdAt?: string;
  clipCount: number;
  clips: ManiClipEntry[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedProject = searchParams.get('project');

    const candidateRoots = [
      'D:\\Mani Clips Projects',
      path.join(process.env.USERPROFILE || 'C:\\Users\\admin', 'Documents', 'Mani Clips'),
      'D:\\Mani Clips',
    ];

    const searchRoots = candidateRoots.filter((p) => fs.existsSync(/*turbopackIgnore: true*/ p));

    if (searchRoots.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No Mani Clips project folder found.',
        projects: [],
        clips: [],
      });
    }

    const projects: ManiProject[] = [];
    const allClips: ManiClipEntry[] = [];
    const seenProjectNames = new Set<string>();

    for (const rootDir of searchRoots) {
      const subdirs = fs
        .readdirSync(rootDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      for (const dir of subdirs) {
        if (seenProjectNames.has(dir.toLowerCase())) continue;
        seenProjectNames.add(dir.toLowerCase());

        const projectDir = path.join(rootDir, dir);
        const projectJsonPath = path.join(projectDir, 'project.json');
        const shortsJsonPath = path.join(projectDir, 'AI', 'shorts.json');
        const exportDir = path.join(projectDir, 'Export');

      let videoTitle = dir;
      let projectCreatedAt = '';

      if (fs.existsSync(projectJsonPath)) {
        try {
          const pData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
          if (pData.videos && pData.videos[0]?.originalFileName) {
            videoTitle = pData.videos[0].originalFileName.replace(/\.[^/.]+$/, '');
          }
          projectCreatedAt = pData.createdAt || '';
        } catch {
          // ignore error
        }
      }

      // Read clips from shorts.json if exists
      const projectClips: ManiClipEntry[] = [];
      const seenFiles = new Set<string>();

      if (fs.existsSync(shortsJsonPath)) {
        try {
          const shortsData = JSON.parse(fs.readFileSync(shortsJsonPath, 'utf-8'));
          if (shortsData.entries && Array.isArray(shortsData.entries)) {
            shortsData.entries.forEach((entry: any, idx: number) => {
              const absPath = entry.absolutePath || path.join(exportDir, entry.fileName);
              if (fs.existsSync(/*turbopackIgnore: true*/ absPath)) {
                const stat = fs.statSync(/*turbopackIgnore: true*/ absPath);
                const sizeMb = Number((stat.size / (1024 * 1024)).toFixed(1));
                seenFiles.add(entry.fileName.toLowerCase());

                const clipItem: ManiClipEntry = {
                  id: entry.id || `${dir}_clip_${idx}`,
                  projectId: dir,
                  projectName: dir,
                  videoTitle,
                  clipIndex: entry.clipIndex ?? idx,
                  fileName: entry.fileName,
                  absolutePath: absPath,
                  baseAbsolutePath: entry.baseAbsolutePath,
                  streamUrl: `/api/clipper/stream?file=${encodeURIComponent(absPath)}`,
                  downloadUrl: `/api/clipper/download?file=${encodeURIComponent(absPath)}&name=${encodeURIComponent(entry.fileName)}`,
                  fileSizeMb: sizeMb,
                  durationSec: entry.durationSec || 30,
                  hotScore: Math.round((entry.hotScore || 85) * 10) / 10,
                  captionStyle: entry.captionStyle || 'outline-pop',
                  captions: Array.isArray(entry.captions) ? entry.captions : [],
                };
                projectClips.push(clipItem);
                allClips.push(clipItem);
              }
            });
          }
        } catch {
          // ignore error
        }
      }

      // Also check if there are standalone MP4s in Export directory not covered in shorts.json
      if (fs.existsSync(exportDir)) {
        try {
          const exportFiles = fs
            .readdirSync(exportDir)
            .filter((f) => f.toLowerCase().endsWith('.mp4') && !f.toLowerCase().includes('_base.mp4'));

          exportFiles.forEach((file, idx) => {
            if (!seenFiles.has(file.toLowerCase())) {
              const absPath = path.join(exportDir, file);
              const stat = fs.statSync(absPath);
              const sizeMb = Number((stat.size / (1024 * 1024)).toFixed(1));
              const clipItem: ManiClipEntry = {
                id: `${dir}_export_${idx}`,
                projectId: dir,
                projectName: dir,
                videoTitle,
                clipIndex: idx,
                fileName: file,
                absolutePath: absPath,
                streamUrl: `/api/clipper/stream?file=${encodeURIComponent(absPath)}`,
                downloadUrl: `/api/clipper/download?file=${encodeURIComponent(absPath)}&name=${encodeURIComponent(file)}`,
                fileSizeMb: sizeMb,
                durationSec: 30,
                hotScore: 82.5,
                captionStyle: 'outline-pop',
                captions: [],
              };
              projectClips.push(clipItem);
              allClips.push(clipItem);
            }
          });
        } catch {
          // ignore error
        }
      }

      // Sort clips by hotScore descending
      projectClips.sort((a, b) => b.hotScore - a.hotScore);

      if (projectClips.length > 0) {
        projects.push({
          id: dir,
          name: dir,
          videoTitle,
          folderPath: projectDir,
          createdAt: projectCreatedAt,
          clipCount: projectClips.length,
          clips: projectClips,
        });
      }
    }
    }

    // Sort all clips by hotScore descending
    allClips.sort((a, b) => b.hotScore - a.hotScore);

    if (requestedProject) {
      const found = projects.find((p) => p.id === requestedProject || p.name === requestedProject);
      return NextResponse.json({
        success: true,
        project: found || null,
        clips: found ? found.clips : [],
      });
    }

    return NextResponse.json({
      success: true,
      totalProjects: projects.length,
      totalClips: allClips.length,
      projects,
      clips: allClips,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      projects: [],
      clips: [],
    });
  }
}
