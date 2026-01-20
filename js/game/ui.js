export const WATER_ICON_SRC = "images/ui/hud/icon_water.png";
export const STAM_ICON_SRC = "images/ui/hud/icon_stamina.png";
export const HEART_ICON_SRC = "images/ui/hud/icon_heart.png";

let waterImg = null;
let stamImg = null;
let waterReady = false;
let stamReady = false;
let heartImg = null;
let heartReady = false;

export function initUI() {
  // 預載圖示
  waterImg = new Image();
  waterImg.src = WATER_ICON_SRC;
  waterImg.onload = () => (waterReady = true);

  stamImg = new Image();
  stamImg.src = STAM_ICON_SRC;
  stamImg.onload = () => (stamReady = true);

  heartImg = new Image();
  heartImg.src = HEART_ICON_SRC;
  heartImg.onload = () => (heartReady = true);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function makeNeonGradient(ctx, x, y, r, theme) {
  const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
  if (theme === "water") {
    // 白色為主，藍色作為邊緣
    g.addColorStop(0.0, "rgba(255, 255, 255, 0.98)");
    g.addColorStop(0.75, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(1.0, "rgba(90, 185, 255, 0.85)");
  } else {
    // 白色為主，橙色作為邊緣
    g.addColorStop(0.0, "rgba(255, 255, 255, 0.98)");
    g.addColorStop(0.75, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(1.0, "rgba(255, 165, 80, 0.85)");
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

  // 霓虹進度圈
  const grad = makeNeonGradient(ctx, x, y, r, theme);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, r * 0.18);

  // 外光暈
  ctx.strokeStyle = grad;
  ctx.globalAlpha = 0.35;
  ctx.shadowBlur = r * 0.9;
  ctx.shadowColor = theme === "water" ? "rgba(90, 185, 255, 0.55)" : "rgba(255, 165, 80, 0.55)";
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
  ctx.shadowColor = theme === "water" ? "rgba(90, 185, 255, 0.5)" : "rgba(255, 165, 80, 0.5)";
  ctx.beginPath();
  ctx.arc(x, y, rOuter, start, end);
  ctx.stroke();

  ctx.restore();
}

function drawIcon(ctx, x, y, size, img, ready) {
  // 內底
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
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

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawHealth(ctx, x, centerY, values = {}) {
  // x 是整組最左邊；centerY 跟水分圓心對齊
  const health = (typeof values.health === "number") ? values.health : 100;
  const healthMax = (typeof values.healthMax === "number" && values.healthMax > 0) ? values.healthMax : 100;
  const ratio = clamp01(health / healthMax);

  const heartSize = (typeof values.heartSize === "number") ? values.heartSize : 22;
  const barW = (typeof values.barW === "number") ? values.barW : 110; // 預留足夠空間
  const barH = (typeof values.barH === "number") ? values.barH : 10;

  const padX = 10;
  const padY = 8;
  const gap = 10;

  const boxW = padX * 2 + heartSize + gap + barW;
  const boxH = padY * 2 + Math.max(heartSize, barH);

  const boxY = centerY - boxH / 2;

  ctx.save();

  // 很淡的黑色背景框住整組（更淡）
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  roundRectPath(ctx, x, boxY, boxW, boxH, 10);
  ctx.fill();

  // Heart icon
  const heartX = x + padX;
  const heartY = centerY - heartSize / 2;

  if (heartImg && heartReady) {
    ctx.globalAlpha = 0.95;
    ctx.drawImage(heartImg, heartX, heartY, heartSize, heartSize);
  } else {
    // fallback：沒有圖就畫個小圓
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(heartX + heartSize / 2, centerY, heartSize * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Health bar（跟 heart 連著）
  const barX = heartX + heartSize + gap;
  const barY = centerY - barH / 2;

  // 文字：health/healthMax（在血條上方）
  {
    const txt = `${Math.max(0, Math.round(health))}/${Math.max(1, Math.round(healthMax))}`;
    ctx.save();
    ctx.font = "12px sans-serif";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.fillText(txt, barX, barY - 2);
    ctx.restore();
  }

  // bar background
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  roundRectPath(ctx, barX, barY, barW, barH, barH / 2);
  ctx.fill();

  // bar fill：紅為主，帶一點白色高光
  const fillW = Math.max(0, barW * ratio);
  if (fillW > 0) {
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    // 以紅色為主，帶一點白色高光
    grad.addColorStop(0.0, "rgba(255, 255, 255, 0.55)");
    grad.addColorStop(0.18, "rgba(255, 120, 120, 0.92)");
    grad.addColorStop(1.0, "rgba(210, 60, 60, 0.92)");
    ctx.fillStyle = grad;
    roundRectPath(ctx, barX, barY, fillW, barH, barH / 2);
    ctx.fill();
  }

  // subtle outline（更淡）
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = 1;
  roundRectPath(ctx, x + 0.5, boxY + 0.5, boxW - 1, boxH - 1, 10);
  ctx.stroke();

  ctx.restore();

  return { boxW, boxH };
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
 * @param {number} [values.health] - 當前生命值
 * @param {number} [values.healthMax] - 最大生命值
 * @param {number} [values.radius] - 內圈半徑（可調）
 * @param {number} [values.gap] - 兩圓之間距（可調）
 */
export function drawVitals(ctx, anchorX, anchorY, values = {}) {
  if (!ctx) return;

  const r = typeof values.radius === "number" ? values.radius : 18;
  const gap = typeof values.gap === "number" ? values.gap : 24;

  const hyd = (typeof values.hydration === "number") ? values.hydration : 100;
  const hydMax = (typeof values.hydrationMax === "number" && values.hydrationMax > 0) ? values.hydrationMax : 100;
  const sta = (typeof values.stamina === "number") ? values.stamina : 100;
  const staMax = (typeof values.staminaMax === "number" && values.staminaMax > 0) ? values.staminaMax : 100;

  const hydR = clamp01(hyd / hydMax);
  const staR = clamp01(sta / staMax);

  const x1 = anchorX;
  const x2 = anchorX + (r * 2 + gap);
  const y = anchorY;

  // 外薄圈半徑
  const rOuter = r + Math.max(4, r * 0.35);

  // Health
  {
    const heartSize = 22;
    const barW = 110;
    const barH = 10;

    // 與水分外環保持距離
    const leftGap = 18;

    // drawHealth 會用 padX(10) + gap(10)，所以這裡用同樣的寬度估算，避免貼到水分圈
    const padX = 10;
    const innerGap = 10;
    const boxW = padX * 2 + heartSize + innerGap + barW;

    const boxX = x1 - (rOuter + leftGap + boxW);
    drawHealth(ctx, boxX, y, {
      health: values.health,
      healthMax: values.healthMax,
      heartSize,
      barW,
      barH,
    });
  }

  // 水分（左）
  drawOuterThinRing(ctx, x1, y, rOuter, hydR, "water");
  drawRing(ctx, x1, y, r, hydR, "water");
  drawIcon(ctx, x1, y, r * 1.0, waterImg, waterReady);

  // 體力（右）
  drawOuterThinRing(ctx, x2, y, rOuter, staR, "stamina");
  drawRing(ctx, x2, y, r, staR, "stamina");
  drawIcon(ctx, x2, y, r * 1.0, stamImg, stamReady);
}