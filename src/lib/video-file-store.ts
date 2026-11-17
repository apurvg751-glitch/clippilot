// Client-side registry to hold real video File binaries between Upload Modal and Publishing Centre

const videoFileMap = new Map<string, File>();

export function saveVideoFile(videoId: string, file: File): void {
  if (typeof window !== 'undefined') {
    videoFileMap.set(videoId, file);
    (window as any).__clippilot_video_files = videoFileMap;
  }
}

export function getVideoFile(videoId: string): File | null {
  if (typeof window !== 'undefined') {
    return videoFileMap.get(videoId) || (window as any).__clippilot_video_files?.get(videoId) || null;
  }
  return null;
}

export function hasVideoFile(videoId: string): boolean {
  return Boolean(getVideoFile(videoId));
}
