import { VideoItem, DailyAnalyticsSnapshot } from '@/types';

export function exportVideosToCSV(videos: VideoItem[]) {
  const headers = [
    'Video ID',
    'Title',
    'Status',
    'Duration (s)',
    'Aspect Ratio',
    'Created At',
    'YouTube Views',
    'YouTube Likes',
    'YouTube Comments',
    'Instagram Views',
    'Instagram Likes',
    'Instagram Comments',
    'TikTok Views',
    'TikTok Likes',
    'TikTok Comments',
    'Combined Platform Views',
    'Total Engagements',
    'Avg Engagement Rate (%)',
  ];

  const rows = videos.map((v) => {
    const yt = v.posts.find((p) => p.platform === 'youtube');
    const ig = v.posts.find((p) => p.platform === 'instagram');
    const tt = v.posts.find((p) => p.platform === 'tiktok');

    const ytViews = yt?.views || 0;
    const igViews = ig?.views || 0;
    const ttViews = tt?.views || 0;
    const combinedViews = ytViews + igViews + ttViews;

    const ytEng = (yt?.likes || 0) + (yt?.comments || 0) + (yt?.shares || 0);
    const igEng = (ig?.likes || 0) + (ig?.comments || 0) + (ig?.shares || 0);
    const ttEng = (tt?.likes || 0) + (tt?.comments || 0) + (tt?.shares || 0);
    const totalEng = ytEng + igEng + ttEng;

    const avgEngRate = combinedViews > 0 ? ((totalEng / combinedViews) * 100).toFixed(2) : '0.00';

    return [
      `"${v.id}"`,
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.status}"`,
      v.durationSeconds,
      `"${v.aspectRatio}"`,
      `"${v.createdAt.split('T')[0]}"`,
      ytViews,
      yt?.likes || 0,
      yt?.comments || 0,
      igViews,
      ig?.likes || 0,
      ig?.comments || 0,
      ttViews,
      tt?.likes || 0,
      tt?.comments || 0,
      combinedViews,
      totalEng,
      avgEngRate,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, `clippilot_videos_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

export function exportGrowthToCSV(snapshots: DailyAnalyticsSnapshot[]) {
  const headers = [
    'Date',
    'Combined Views',
    'YouTube Views',
    'Instagram Views',
    'TikTok Views',
    'Total Followers',
    'YouTube Subscribers',
    'Instagram Followers',
    'TikTok Followers',
    'Net New Followers',
  ];

  const rows = snapshots.map((s) => [
    s.date,
    s.combinedViews,
    s.youtubeViews,
    s.instagramViews,
    s.tiktokViews,
    s.totalFollowers,
    s.youtubeSubscribers,
    s.instagramFollowers,
    s.tiktokFollowers,
    s.netNewFollowers,
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, `clippilot_growth_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
