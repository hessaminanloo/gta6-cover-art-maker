// The cover renderer for Neon Coast Cover Studio.
//
// drawCover paints the whole poster onto a canvas at the exact export
// size: panels first (each photo framed, graded and keylined), then
// the lettering block over a dusk band at the foot of the frame, then
// a whisper of film grain over everything so the print feels like
// paper, not pixels.

import { layoutById } from './layouts.js';
import { gradeById } from './grades.js';
import { sizeById } from './state.js';

const TITLE_STACK = "'Arial Narrow Bold', 'Arial Narrow', Impact, 'Franklin Gothic Medium', 'Helvetica Neue', sans-serif";
const SUB_STACK = "'Segoe UI', 'Trebuchet MS', Verdana, sans-serif";

let grainTile = null;

function makeGrainTile() {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 108 + Math.floor(Math.random() * 42);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  return tile;
}

function panelRectPx(unit, W, H) {
  const x0 = Math.round(unit.x * W);
  const y0 = Math.round(unit.y * H);
  return {
    x: x0,
    y: y0,
    w: Math.round((unit.x + unit.w) * W) - x0,
    h: Math.round((unit.y + unit.h) * H) - y0,
  };
}

function drawPhoto(ctx, img, rect, panel, grade) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const sw = rect.w / scale;
  const sh = rect.h / scale;
  let sx = panel.cx * iw - sw / 2;
  let sy = panel.cy * ih - sh / 2;
  sx = Math.min(Math.max(sx, 0), Math.max(0, iw - sw));
  sy = Math.min(Math.max(sy, 0), Math.max(0, ih - sh));
  ctx.filter = `saturate(${grade.sat}) contrast(${grade.con})`;
  ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
  ctx.filter = 'none';
}

// A panel with no photo yet is painted as poster art in the grade's
// own colours, so a half-built cover still reads as a design.
function drawPosterArt(ctx, rect, grade, seed) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, '#1b1035');
  g.addColorStop(0.55, grade.bottom);
  g.addColorStop(1, '#0a0618');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const sunR = Math.min(rect.w, rect.h) * 0.26;
  const sunX = rect.x + rect.w * (0.32 + 0.12 * (seed % 3));
  const sunY = rect.y + rect.h * 0.38;
  ctx.fillStyle = grade.top;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, rect.h * 0.006);
  for (let i = 0; i < 4; i++) {
    const y = rect.y + rect.h * (0.68 + i * 0.08);
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.w * 0.08, y);
    ctx.lineTo(rect.x + rect.w * 0.92, y);
    ctx.stroke();
  }
}

function applyGrade(ctx, rect, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = grade.lift;
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const shade = ctx.createLinearGradient(0, rect.y + rect.h * 0.5, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(8,0,16,0)');
  shade.addColorStop(1, 'rgba(8,0,16,0.38)');
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.42,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.78);
  vig.addColorStop(0, 'rgba(4,0,10,0)');
  vig.addColorStop(1, 'rgba(4,0,10,0.30)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function strokePanel(ctx, rect, W) {
  const lw = Math.max(3, Math.round(W * 0.0036));
  ctx.strokeStyle = 'rgba(5,0,10,0.9)';
  ctx.lineWidth = lw * 2.1;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = lw;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function setSpacing(ctx, px) {
  try {
    ctx.letterSpacing = `${px}px`;
  } catch (err) {
    // Older engines have no canvas letter-spacing; the lettering
    // simply sits tighter there.
  }
}

function drawLettering(ctx, W, H, st, grade) {
  const caption = (st.caption || '').trim().toUpperCase();
  const subtitle = (st.subtitle || '').trim();
  if (!caption && !subtitle) return;
  const band = ctx.createLinearGradient(0, H * 0.58, 0, H);
  band.addColorStop(0, 'rgba(6,0,12,0)');
  band.addColorStop(0.45, 'rgba(6,0,12,0.42)');
  band.addColorStop(1, 'rgba(6,0,12,0.82)');
  ctx.fillStyle = band;
  ctx.fillRect(0, H * 0.58, W, H * 0.42);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if (caption) {
    let fs = Math.round(H * 0.148);
    ctx.font = `900 ${fs}px ${TITLE_STACK}`;
    while (ctx.measureText(caption).width > W * 0.93 && fs > 12) {
      fs = Math.floor(fs * 0.94);
      ctx.font = `900 ${fs}px ${TITLE_STACK}`;
    }
    setSpacing(ctx, Math.max(0, Math.round(fs * 0.015)));
    const base = H * (subtitle ? 0.878 : 0.915);
    const fill = ctx.createLinearGradient(0, base - fs, 0, base);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(0.55, grade.ink);
    fill.addColorStop(1, grade.bottom);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160409';
    ctx.lineWidth = Math.max(2, fs * 0.15);
    ctx.strokeText(caption, W / 2, base);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = fs * 0.10;
    ctx.shadowOffsetY = fs * 0.045;
    ctx.fillStyle = fill;
    ctx.fillText(caption, W / 2, base);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  if (subtitle) {
    const fs2 = Math.round(H * 0.040);
    ctx.font = `italic 700 ${fs2}px ${SUB_STACK}`;
    setSpacing(ctx, Math.round(fs2 * 0.14));
    ctx.shadowColor = grade.bottom;
    ctx.shadowBlur = fs2 * 0.55;
    ctx.fillStyle = grade.ink;
    ctx.fillText(subtitle, W / 2, H * 0.958);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  setSpacing(ctx, 0);
}

export function drawCover(canvas, st, highlightIndex = -1) {
  const size = sizeById(st.sizeId);
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const W = size.w;
  const H = size.h;
  const grade = gradeById(st.gradeId);
  const layout = layoutById(st.layoutId);
  ctx.fillStyle = '#05010d';
  ctx.fillRect(0, 0, W, H);
  layout.panels.forEach((unit, i) => {
    const rect = panelRectPx(unit, W, H);
    const panel = st.panels[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (panel && panel.photo >= 0 && st.photos[panel.photo]) {
      drawPhoto(ctx, st.photos[panel.photo].img, rect, panel, grade);
    } else {
      drawPosterArt(ctx, rect, grade, i);
    }
    ctx.restore();
    applyGrade(ctx, rect, grade);
    strokePanel(ctx, rect, W);
  });
  drawLettering(ctx, W, H, st, grade);
  if (!grainTile) grainTile = makeGrainTile();
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (highlightIndex >= 0 && layout.panels[highlightIndex]) {
    const rect = panelRectPx(layout.panels[highlightIndex], W, H);
    ctx.strokeStyle = '#37f4ff';
    ctx.lineWidth = Math.max(3, W * 0.004);
    ctx.setLineDash([W * 0.012, W * 0.008]);
    ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
    ctx.setLineDash([]);
  }
  return canvas;
}
