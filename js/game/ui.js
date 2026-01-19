export const WATER_ICON_SRC = "images/ui/hud/icon_water.png";
export const STAM_ICON_SRC = "images/ui/hud/icon_stamina.png";

let waterImg = null;
let stamImg = null;
let waterReady = false;
let stamReady = false;

export function initUI() {
  // 預載兩張圖示（你也可以不放圖，照樣會畫圈）
  waterImg = new Image();
  waterImg.src = WATER_ICON_SRC;
  waterImg.onload = () => (waterReady = true);

  stamImg = new Image();
  stamImg.src = STAM_ICON_SRC;
  stamImg.onload = () => (stamReady = true);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function makeNeonGradient(ctx, x, y, r, theme) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
  if (theme === "water") {
    // 藍白藍
    g.addColorStop(0.0, "rgba(120, 220, 255, 0.95)");
    g.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(1.0, "rgba(40, 140, 255, 0.95)");
  } else {
    // 橙白橙
    g.addColorStop(0.0, "rgba(255, 190, 90, 0.95)");
    g.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(1.0, "rgba(255, 120, 40, 0.95)");
  }
  return g;
}

function drawRing(ctx, x, y, r, ratio, theme) {
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * clamp01(ratio);

  // 背景圈
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, r * 0.18);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 霓虹進度圈（多描幾次做 glow）
  const grad = makeNeonGradient(ctx, x, y, r, theme);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, r * 0.18);

  // 外光暈
  ctx.strokeStyle = grad;
  ctx.globalAlpha = 0.35;
  ctx.shadowBlur = r * 0.9;
  ctx.shadowColor = theme === "water" ? "rgba(80, 180, 255, 0.9)" : "rgba(255, 150, 60, 0.9)";
  ctx.beginPath();
  ctx.arc(x, y, r, start, end);
  ctx.stroke();

  // 中層
  ctx.globalAlpha = 0.65;
  ctx.shadowBlur = r * 0.45;
  ctx.beginPath();
  ctx.arc(x, y, r, start, end);
  ctx.stroke();

  // 內層亮線
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, r, start, end);
  ctx.stroke();

  ctx.restore();
}

function drawOuterThinRing(ctx, x, y, rOuter, ratio, theme) {
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * clamp01(ratio);

  // 薄底圈
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, rOuter * 0.08);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.arc(x, y, rOuter, 0, Math.PI * 2);
  ctx.stroke();

  const grad = makeNeonGradient(ctx, x, y, rOuter, theme);

  // 薄進度圈
  ctx.strokeStyle = grad;
  ctx.shadowBlur = rOuter * 0.55;
  ctx.shadowColor = theme === "water" ? "rgba(80, 180, 255, 0.85)" : "rgba(255, 150, 60, 0.85)";
  ctx.beginPath();
  ctx.arc(x, y, rOuter, start, end);
  ctx.stroke();

  ctx.restore();
}

function drawIcon(ctx, x, y, size, img, ready) {
  // 內底
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.beginPath();
  ctx.arc(x, y, size * 0.52, 0, Math.PI * 2);
  ctx.fill();

  // 圖示（可選）
  if (img && ready) {
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  }

  ctx.restore();
}

/**
 * 畫兩個圓圈狀態：左水分、右體力
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} anchorX - 左邊水分圓心 X
 * @param {number} anchorY - 兩個圓的圓心 Y
 * @param {object} values
 * @param {number} values.hydration - 當前水分
 * @param {number} values.hydrationMax - 最大水分
 * @param {number} values.stamina - 當前體力
 * @param {number} values.staminaMax - 最大體力
 * @param {number} [values.radius] - 內圈半徑（可調）
 * @param {number} [values.gap] - 兩圓之間距（可調）
 */
export function drawVitals(ctx, anchorX, anchorY, values = {}) {
  if (!ctx) return;

  const r = typeof values.radius === "number" ? values.radius : 18;
  const gap = typeof values.gap === "number" ? values.gap : 16;

  const hyd = (typeof values.hydration === "number") ? values.hydration : 100;
  const hydMax = (typeof values.hydrationMax === "number" && values.hydrationMax > 0) ? values.hydrationMax : 100;
  const sta = (typeof values.stamina === "number") ? values.stamina : 100;
  const staMax = (typeof values.staminaMax === "number" && values.staminaMax > 0) ? values.staminaMax : 100;

  const hydR = clamp01(hyd / hydMax);
  const staR = clamp01(sta / staMax);

  const x1 = anchorX;
  const x2 = anchorX + (r * 2 + gap);
  const y = anchorY;

  // 外薄圈半徑（窄一點的外環）
  const rOuter = r + Math.max(4, r * 0.35);

  // 水分（左）
  drawOuterThinRing(ctx, x1, y, rOuter, hydR, "water");
  drawRing(ctx, x1, y, r, hydR, "water");
  drawIcon(ctx, x1, y, r * 1.2, waterImg, waterReady);

  // 體力（右）
  drawOuterThinRing(ctx, x2, y, rOuter, staR, "stamina");
  drawRing(ctx, x2, y, r, staR, "stamina");
  drawIcon(ctx, x2, y, r * 1.2, stamImg, stamReady);
}