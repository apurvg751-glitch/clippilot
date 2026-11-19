import { getCategoryConfig } from './industryCategories';

export interface StandTheme {
  id: string;
  categoryLabel: string;
  icon: string;
  hook: string;
  primaryColor: string;
  secondaryColor: string;
  gradientClass: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

export const STAND_THEMES: Record<string, StandTheme> = {
  food: {
    id: 'food',
    categoryLabel: 'Sweet Shop, Restaurant & Cafe',
    icon: '🍰',
    hook: 'Loved our sweets & fresh taste?',
    primaryColor: '#d97706',
    secondaryColor: '#ea580c',
    gradientClass: 'from-amber-500 via-orange-500 to-amber-700',
    accentBg: '#fffbeb',
    accentBorder: '#fde68a',
    accentText: '#92400e',
  },
  auto: {
    id: 'auto',
    categoryLabel: 'Automotive & Detailing',
    icon: '🚗',
    hook: "Loved your vehicle's care & finish?",
    primaryColor: '#2563eb',
    secondaryColor: '#06b6d4',
    gradientClass: 'from-blue-600 via-cyan-600 to-indigo-800',
    accentBg: '#eff6ff',
    accentBorder: '#bfdbfe',
    accentText: '#1e40af',
  },
  salon: {
    id: 'salon',
    categoryLabel: 'Salon, Spa & Grooming',
    icon: '✂️',
    hook: 'Loving your fresh new look & style?',
    primaryColor: '#db2777',
    secondaryColor: '#9333ea',
    gradientClass: 'from-rose-500 via-pink-500 to-purple-800',
    accentBg: '#fdf2f8',
    accentBorder: '#fbcfe8',
    accentText: '#9d174d',
  },
  healthcare: {
    id: 'healthcare',
    categoryLabel: 'Healthcare & Dental Clinic',
    icon: '🩺',
    hook: 'How was your consultation & care?',
    primaryColor: '#059669',
    secondaryColor: '#0d9488',
    gradientClass: 'from-emerald-500 via-teal-500 to-cyan-800',
    accentBg: '#ecfdf5',
    accentBorder: '#a7f3d0',
    accentText: '#065f46',
  },
  fitness: {
    id: 'fitness',
    categoryLabel: 'Gym & Fitness Center',
    icon: '💪',
    hook: 'Crushed your workout session today?',
    primaryColor: '#dc2626',
    secondaryColor: '#ea580c',
    gradientClass: 'from-red-600 via-orange-600 to-stone-900',
    accentBg: '#fef2f2',
    accentBorder: '#fecaca',
    accentText: '#991b1b',
  },
  retail: {
    id: 'retail',
    categoryLabel: 'Retail, Fashion & Shopping',
    icon: '🛍️',
    hook: 'Loved shopping with us today?',
    primaryColor: '#b45309',
    secondaryColor: '#7c2d12',
    gradientClass: 'from-amber-600 via-yellow-600 to-stone-900',
    accentBg: '#fffbeb',
    accentBorder: '#fde68a',
    accentText: '#78350f',
  },
  general: {
    id: 'general',
    categoryLabel: 'Local Business & Professional Services',
    icon: '⭐',
    hook: 'How was your experience today?',
    primaryColor: '#475569',
    secondaryColor: '#0f172a',
    gradientClass: 'from-slate-700 via-slate-800 to-slate-950',
    accentBg: '#f8fafc',
    accentBorder: '#e2e8f0',
    accentText: '#334155',
  },
};

export function getStandTheme(rawCategory?: string): StandTheme {
  const config = getCategoryConfig(rawCategory);
  return STAND_THEMES[config.id] || STAND_THEMES.general;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes = 5,
  outerRadius = 26,
  innerRadius = 13
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export interface StandCanvasOptions {
  shopName: string;
  category: string;
  city?: string;
  slug: string;
  qrDataUrl: string;
}

/**
 * Generates an ultra-crisp 1200x1800 (4x6" @ 300 DPI) personalized acrylic stand graphic
 */
export async function generateStandCanvas(options: StandCanvasOptions): Promise<string> {
  const { shopName, category, city, qrDataUrl } = options;
  const theme = getStandTheme(category);

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');

  // 1. Acrylic White Canvas with subtle drop-in background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1200, 1800);

  // Subtle luxury border (inner acrylic bevel)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 14;
  roundRect(ctx, 30, 30, 1140, 1740, 48);
  ctx.stroke();

  // Thin outer gold/accent keyline
  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 3;
  roundRect(ctx, 42, 42, 1116, 1716, 40);
  ctx.stroke();

  // 2. Top Theme Gradient Bar
  const grad = ctx.createLinearGradient(42, 42, 1158, 42);
  grad.addColorStop(0, theme.primaryColor);
  grad.addColorStop(0.5, theme.secondaryColor);
  grad.addColorStop(1, theme.primaryColor);
  ctx.fillStyle = grad;
  ctx.fillRect(42, 42, 1116, 18);

  // 3. Category Pill Badge
  const categoryText = `${theme.icon} ${theme.categoryLabel.toUpperCase()}`;
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const catWidth = ctx.measureText(categoryText).width + 50;
  const catX = (1200 - catWidth) / 2;
  const catY = 120;

  ctx.fillStyle = theme.accentBg;
  roundRect(ctx, catX, catY, catWidth, 46, 23);
  ctx.fill();
  ctx.strokeStyle = theme.accentBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, catX, catY, catWidth, 46, 23);
  ctx.stroke();

  ctx.fillStyle = theme.accentText;
  ctx.textAlign = 'center';
  ctx.fillText(categoryText, 600, catY + 32);

  // 4. Shop Name (Auto-scaled for long names)
  const displayName = (shopName || 'STORE').toUpperCase();
  let nameFontSize = 66;
  ctx.font = `900 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  while (ctx.measureText(displayName).width > 950 && nameFontSize > 34) {
    nameFontSize -= 4;
    ctx.font = `900 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText(displayName, 600, 230);

  // 5. City & Verified Subtitle
  const locationSub = `${(city || 'India').toUpperCase()} • REPUBOOST™ VERIFIED PARTNER`;
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(locationSub, 600, 280);

  // 6. 5 Golden Stars
  const starSpacing = 68;
  const starStartX = 600 - (2 * starSpacing);
  const starY = 345;
  for (let i = 0; i < 5; i++) {
    const sx = starStartX + (i * starSpacing);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 12;
    drawStar(ctx, sx, starY, 5, 28, 14);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 7. Personalized Experience Hook
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(theme.hook, 600, 435);

  // 8. "REVIEW US ON GOOGLE" Official Header Box
  const gBoxWidth = 560;
  const gBoxX = (1200 - gBoxWidth) / 2;
  const gBoxY = 480;

  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, gBoxX, gBoxY, gBoxWidth, 60, 30);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  roundRect(ctx, gBoxX, gBoxY, gBoxWidth, 60, 30);
  ctx.stroke();

  // Draw colorful Google "G" representation and text
  ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('RATE US ON GOOGLE MAPS', 600, gBoxY + 40);

  // 9. QR Code Display Container
  const qrFrameSize = 640;
  const qrX = (1200 - qrFrameSize) / 2;
  const qrY = 575;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, qrX, qrY, qrFrameSize, qrFrameSize, 40);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 4;
  roundRect(ctx, qrX, qrY, qrFrameSize, qrFrameSize, 40);
  ctx.stroke();

  // Load and draw QR code onto canvas
  if (qrDataUrl) {
    await new Promise<void>((resolve, reject) => {
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        // Draw 560x560 QR centered in 640x640 frame
        ctx.drawImage(qrImg, qrX + 40, qrY + 40, 560, 560);
        resolve();
      };
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });
  }

  // 10. Scan Instructions
  ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Scan with Any Phone Camera', 600, 1370);

  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Takes 5 seconds • No app download required', 600, 1430);

  // 11. Footer Branding
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('REPUBOOST™', 600, 1680);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Triggers a 1-click download of the complete designed 4x6" acrylic stand graphic
 */
export async function downloadDesignedStand(options: StandCanvasOptions): Promise<void> {
  const dataUrl = await generateStandCanvas(options);
  const cleanSlug = options.slug || 'store';
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${cleanSlug}_designed_stand_4x6.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
