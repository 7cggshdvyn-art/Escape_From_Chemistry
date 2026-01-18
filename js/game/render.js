import { isUIFocus } from "./input.js";
let canvas, ctx;
let arrowImg;
let arrowReady = false;

// ===== Hotbar icon cache =====
const hotbarIconCache = new Map();

let crossUpImg, crossDownImg, crossLeftImg, crossRightImg, crossDotImg;
let crossUpReady = false;
let crossDownReady = false;
let crossLeftReady = false;
let crossRightReady = false;
let crossDotReady = false;

// ===== Crosshair spread animation (gap lerp) =====
let crossGapPx = null; // 當前四段距離（px），用來做平滑動畫

// ===== ADS (aim) timing =====
let aimProgress = 0; // 0~1
let lastRenderAt = 0;

// ===== Recoil visual (crosshair kick) =====
let recoilVisX = 0; // px
let recoilVisY = 0; // px

// 後座力弧度 -> 像素 的縮放（想更明顯就調大）
const RECOIL_VIS_PX_PER_RAD = 500;

// 視覺回正速度（越大回得越快）
const RECOIL_VIS_RETURN = 18;

// 鼠标坐标
let mouseX = 0;
let mouseY = 0;
let hasMouse = true;

// 箭头路径
const ARROW_SRC = "images/character/arrow.png";

// 你自己把路徑改成 5 張圖
const CROSS_UP_SRC = "images/ui/on-go/crosshair_up.png";
const CROSS_DOWN_SRC = "images/ui/on-go/crosshair_down.png";
const CROSS_LEFT_SRC = "images/ui/on-go/crosshair_left.png";
const CROSS_RIGHT_SRC = "images/ui/on-go/crosshair_right.png";
const CROSS_DOT_SRC = "images/ui/on-go/crosshair_dot.png";

export function initRender() {
  // 找 canvas
  canvas = document.getElementById("game-canvas");

  if (!canvas) {
    console.error('找不到 <canvas id="game-canvas">，请先把 canvas 加到 index.html 里');
    return;
  }

  ctx = canvas.getContext("2d");

  // 设定画布尺寸（先跟视窗一样大）
  resizeCanvas();
  // 初始把准星放在画面中心（不需要等 mousemove）
  mouseX = canvas.width / 2;
  mouseY = canvas.height / 2;
  hasMouse = true;

  window.addEventListener("resize", resizeCanvas);

  // 载入箭头图片
  arrowImg = new Image();
  arrowImg.src = ARROW_SRC;
  arrowImg.onload = () => {
    arrowReady = true;
    console.log("arrow image loaded:", ARROW_SRC);
  };
  arrowImg.onerror = () => {
    console.error("箭头图片加载失败，检查路径：", ARROW_SRC);
  };

  // 载入准星图片（5 部件）
  crossUpImg = new Image();
  crossUpImg.src = CROSS_UP_SRC;
  crossUpImg.onload = () => {
    crossUpReady = true;
    console.log("crosshair up loaded:", CROSS_UP_SRC);
  };

  crossDownImg = new Image();
  crossDownImg.src = CROSS_DOWN_SRC;
  crossDownImg.onload = () => {
    crossDownReady = true;
    console.log("crosshair down loaded:", CROSS_DOWN_SRC);
  };

  crossLeftImg = new Image();
  crossLeftImg.src = CROSS_LEFT_SRC;
  crossLeftImg.onload = () => {
    crossLeftReady = true;
    console.log("crosshair left loaded:", CROSS_LEFT_SRC);
  };

  crossRightImg = new Image();
  crossRightImg.src = CROSS_RIGHT_SRC;
  crossRightImg.onload = () => {
    crossRightReady = true;
    console.log("crosshair right loaded:", CROSS_RIGHT_SRC);
  };

  crossDotImg = new Image();
  crossDotImg.src = CROSS_DOT_SRC;
  crossDotImg.onload = () => {
    crossDotReady = true;
    console.log("crosshair dot loaded:", CROSS_DOT_SRC);
  };

  // 显示画布（如果你一开始隐藏它）
  canvas.style.display = "block";

  // 记录鼠标位置（相对 canvas）——用 window 监听，避免被菜单层挡住拿不到 mousemove
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    hasMouse = true;
  });
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 如果还没有收到过 mousemove，就把准星维持在中心
  if (!hasMouse) {
    mouseX = canvas.width / 2;
    mouseY = canvas.height / 2;
  }
}

export function renderFrame(player, fireVisual = {}) {
  const {
    lastShotVisualAt = 0,
    SHOT_FLASH_DURATION = 0,
  } = fireVisual;

  // ↓↓↓ 你原本 renderFrame 裡面的所有畫圖程式碼都要留在這裡（不要跑到函數外）
  if (!ctx) return;

  // 清画面
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景（先随便填一个暗色，之后你可以换成地图）
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 画玩家（箭头图：指向鼠标）
  const x = player.x;
  const y = player.y;

  // 默认朝向：向右（0 弧度）
  // 如果鼠标在画布内，就用玩家 -> 鼠标的向量算角度
  let angle = player.angle ?? 0;
  if (hasMouse) {
    const dx = mouseX - x;
    const dy = mouseY - y;
    // atan2: 0 表示向右，符合你的初始朝向需求
    angle = Math.atan2(dy, dx);
  }
  // 记住最后一次朝向（鼠标不动/离开后也保持）
  player.angle = angle;

  if (arrowReady) {
    const w = 48;
    const h = 48;

    ctx.save();
    // 移动到玩家中心点再旋转
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 以中心点绘制（图片默认朝右）
    ctx.drawImage(arrowImg, -w / 2, -h / 2, w, h);

    ctx.restore();
  } else {
    // 图片还没加载好，先画个方块占位
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = "#4cff7a";
    ctx.fillRect(-10, -10, 20, 20);

    ctx.restore();
  }

  // ===== 射击可视化：只在「射击瞬间」闪现 =====
  const now = performance.now();
  if (!isUIFocus() && hasMouse && (now - lastShotVisualAt < SHOT_FLASH_DURATION)) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    ctx.restore();
  }
  // 画准星：跟着鼠标位置（相对 canvas 的 screen 坐标）
  // 进入 ESC / 选单(UI focus) 时隐藏准星
  // 规则：腰射不画中点；右键瞄准（window.__aiming === true）才画中点
  if (!isUIFocus()) {
    // dt（秒）
    const t = performance.now();
    const dt = (lastRenderAt > 0) ? Math.min(0.05, (t - lastRenderAt) / 1000) : 0;
    lastRenderAt = t;

    // ===== 把後座力反映到準心（視覺） =====
    const wInst = player?.weapon;
    const recoilPitch = (wInst && typeof wInst.recoilPitch === "number") ? wInst.recoilPitch : 0;
    const recoilYaw = (wInst && typeof wInst.recoilYaw === "number") ? wInst.recoilYaw : 0;

    // 目標偏移（px）：左右 = yaw；往上踢 = pitch（畫面 y 向下為正，所以是負號）
    const targetRecoilX = recoilYaw * RECOIL_VIS_PX_PER_RAD;
    const targetRecoilY = -recoilPitch * RECOIL_VIS_PX_PER_RAD;

    // 平滑：避免每發跳動太生硬（dt 已在上面算好，單位秒）
    if (dt > 0) {
      const k = Math.min(1, dt * RECOIL_VIS_RETURN);
      recoilVisX += (targetRecoilX - recoilVisX) * k;
      recoilVisY += (targetRecoilY - recoilVisY) * k;
    } else {
      recoilVisX = targetRecoilX;
      recoilVisY = targetRecoilY;
    }

    // 你真正看到的準心中心點（滑鼠 + 後座力偏移）
    const cx = mouseX + recoilVisX;
    const cy = mouseY + recoilVisY;

    const aimingRaw = window.__aiming === true;
    const weaponStats = player?.weapon?.def?.stats;

    const hipSpread = (weaponStats && typeof weaponStats.hipSpread === "number") ? weaponStats.hipSpread : 30;
    const aimSpread = (weaponStats && typeof weaponStats.aimSpread === "number") ? weaponStats.aimSpread : 10;

    // aimTime：秒（來自 data_rifle.js），越小越快
    const aimTime = (weaponStats && typeof weaponStats.aimTime === "number" && weaponStats.aimTime > 0)
      ? weaponStats.aimTime
      : 0.25;

    // 進鏡進度（0~1）
    if (dt > 0) {
      const speed = dt / aimTime;
      if (aimingRaw) {
        aimProgress = Math.min(1, aimProgress + speed);
      } else {
        // 退鏡稍微快一點點，看起來比較順
        aimProgress = Math.max(0, aimProgress - speed * 1.25);
      }
    }

    // 對外暴露：讓 input/game 讀到開鏡完成度（不影響現有行為）
    window.__aimProgress = aimProgress;

    // 以進鏡進度混合散布（純 UI）
    const spreadVal = hipSpread + (aimSpread - hipSpread) * aimProgress;

    // aiming（視覺上）：進度夠了才算真正進鏡，用來控制中點顯示
    const aiming = aimProgress >= 0.85;

    // 之后要做动画会用到：gap 控制四段离中心的距离
    // 规则：用武器数据的 hipSpread / aimSpread 来决定 gap，并做平滑动画

    const base = 3;
    const k = 0.19;
    const adsBonus = 1.2; // 數字越大，開鏡越緊
    // 後座力越大，四段越稍微撐開（視覺更明顯；不影響實際彈道）
    const recoilMag = Math.min(1.25, Math.hypot(recoilVisX, recoilVisY) / 120);
    const recoilGapBoost = 2.2 * recoilMag;

    // 注意：spreadVal 已經是 hip->aim 的平滑混合
    const targetGap = base + k * spreadVal - (aimProgress > 0 ? adsBonus * aimProgress : 0) + recoilGapBoost;

    // 平滑（lerp）避免突然跳动
    if (crossGapPx == null) {
      crossGapPx = targetGap;
    } else {
      crossGapPx += (targetGap - crossGapPx) * 0.20;
    }

    // 最终 gap（限制范围，避免极端数值撑爆）
    const gap = Math.max(2, Math.min(18, crossGapPx));


    // 你的素材是 1024x1024，大幅縮小會讓細線被抗鋸齒吃掉，所以先用大一點的顯示尺寸
  const crossScale = 0.9; // 👈 全局縮放倍率（0.4 ~ 0.8 都合理）

    const segW = 36 * crossScale;
    const segH = 36 * crossScale;

    const dotW = 8 * crossScale;
    const dotH = 8 * crossScale;

    const allSegReady = crossUpReady && crossDownReady && crossLeftReady && crossRightReady;

    // 畫準心圖片時關掉抗鋸齒，避免細線縮放後看不見
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (allSegReady) {
      // 上
      ctx.drawImage(crossUpImg, cx - segW / 2, cy - gap - segH, segW, segH);
      // 下
      ctx.drawImage(crossDownImg, cx - segW / 2, cy + gap, segW, segH);
      // 左
      ctx.drawImage(crossLeftImg, cx - gap - segW, cy - segH / 2, segW, segH);
      // 右
      ctx.drawImage(crossRightImg, cx + gap, cy - segH / 2, segW, segH);
    } else {
      // 占位：四段式
      ctx.save();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // 上
      ctx.moveTo(cx, cy - gap - 14);
      ctx.lineTo(cx, cy - gap - 4);
      // 下
      ctx.moveTo(cx, cy + gap + 4);
      ctx.lineTo(cx, cy + gap + 14);
      // 左
      ctx.moveTo(cx - gap - 14, cy);
      ctx.lineTo(cx - gap - 4, cy);
      // 右
      ctx.moveTo(cx + gap + 4, cy);
      ctx.lineTo(cx + gap + 14, cy);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // 中点：只有瞄准才画（直接用 Canvas 画黑点，不依赖图片）
    if (aiming) {
      ctx.save();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      // 半径跟 crossScale 同步（让不同缩放下视觉一致）
      const r = 2.4 * crossScale;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ===== 底部快捷欄（1 2 V 3 4 5 6 7 8） =====
  drawHotbar(player);

  // ===== 通用動作進度條（換彈/互動等共用） =====
  drawActionBar();
}


function drawHotbar(player) {
  if (!ctx || !canvas) return;

  // 1~8 = 槍械/物品槽；0 = V 近戰預留位
  const selected = (typeof window.__hotbarSelected === "number") ? window.__hotbarSelected : 1;

  // 9 個位置：1,2,V,3,4,5,6,7,8
  const layout = [1, 2, 0, 3, 4, 5, 6, 7, 8];

  const size = 44;        // 格子大小
  const gap = 10;         // 格子間距
  const padBottom = 34;   // 離底部距離（整體稍微往下）
  const radius = 8;       // 圓角

  const totalW = layout.length * size + (layout.length - 1) * gap;
  // 整組快捷欄向右偏移（左邊預留 UI 空間）
  const startX = (canvas.width - totalW) / 2 + 120;
  const y = canvas.height - padBottom - size;

  // 純黑、但能看出影子的透明度
  const fill = "rgba(0, 0, 0, 0.18)";
  const stroke = "rgba(0, 0, 0, 0.32)";

  // 選取框更亮（仍用白色讓選取清楚）
  const selStroke = "rgba(255, 255, 255, 0.70)";
  const selFill = "rgba(255, 255, 255, 0.08)";

  ctx.save();
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "14px system-ui, -apple-system, sans-serif";

  // 記錄選取槽位的位置（用來在上方畫子彈數）
  let selectedCenterX = null;
  let selectedTopY = null;

  for (let i = 0; i < layout.length; i++) {
    const slot = layout[i];
    const x = startX + i * (size + gap);

    // 底色（V 近戰位不畫格子，只保留位置）
    if (slot !== 0) {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      roundRect(ctx, x, y, size, size, radius);
      ctx.fill();
      ctx.stroke();
    }

    // 選取高亮（V 近戰位不畫格子高亮）
    if (slot === selected && slot !== 0) {
      selectedCenterX = x + size / 2;
      selectedTopY = y;

      // 先給一點淡淡的底光
      ctx.save();
      ctx.fillStyle = selFill;
      roundRect(ctx, x - 1, y - 1, size + 2, size + 2, radius + 1);
      ctx.fill();

      // 霓虹紅白紅邊框（外紅 / 中白 / 內紅）
      ctx.shadowColor = "rgba(255, 0, 0, 0.55)";
      ctx.shadowBlur = 10;

      // 外紅
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 0, 0, 0.85)";
      roundRect(ctx, x - 2, y - 2, size + 4, size + 4, radius + 2);
      ctx.stroke();

      // 中白
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      roundRect(ctx, x - 1, y - 1, size + 2, size + 2, radius + 1);
      ctx.stroke();

      // 內紅
      ctx.shadowColor = "rgba(255, 0, 0, 0.45)";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 0, 0, 0.75)";
      roundRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, radius);
      ctx.stroke();

      ctx.restore();
    }

    // 物品貼圖：畫在格子內（V 位不畫格子，也不畫 icon）
    if (slot !== 0) {
      const item = player?.inventory?.hotbar?.[slot] ?? null;
      const iconSrc = item?.icon;

      if (typeof iconSrc === "string" && iconSrc.length > 0) {
        const icon = getHotbarIcon(iconSrc);
        if (icon && icon.complete && icon.naturalWidth > 0) {
          // 內縮 padding，避免貼到邊框（稍微放大 icon）
          const pad = 4;
          const iw = size - pad * 2;
          const ih = size - pad * 2;
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(icon, x + pad, y + pad, iw, ih);
          ctx.restore();
        }
      }
    }

    // 標籤：顯示在格子下方（白色底框），V 與數字同一排
    ctx.save();

    const labelY = y + size + 14; // 格子下方位置
    const labelText = (slot === 0) ? "V" : String(slot);

    // 白色小底框尺寸
    const labelW = 18;
    const labelH = 16;

    // 白色底框
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    roundRect(
      ctx,
      x + size / 2 - labelW / 2,
      labelY - labelH / 2,
      labelW,
      labelH,
      4
    );
    ctx.fill();

    // 文字
    ctx.fillStyle = "#000000";
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillText(labelText, x + size / 2, labelY);

    ctx.restore();
  }

  // ===== 子彈數顯示：選到槍時顯示 x/彈夾量 =====
  // 只顯示目前手上武器的彈藥（之後你做多武器切換時再對齊 slot id）
  if (selected !== 0 && selectedCenterX != null && selectedTopY != null) {
    const selItem = player?.inventory?.hotbar?.[selected] ?? null;
    const isRifle = selItem?.type === "rifle";

    if (isRifle && player?.weapon?.def?.stats) {
      const ammo = typeof player.weapon.ammoInMag === "number" ? player.weapon.ammoInMag : 0;
      const mag = typeof player.weapon.def.stats.magSize === "number" ? player.weapon.def.stats.magSize : 0;
      const text = `${ammo}/${mag}`;

      const boxPadX = 8;
      const boxH = 22;
      const boxY = selectedTopY - 12 - boxH; // 在格子上方

      ctx.save();
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      const textW = ctx.measureText(text).width;
      const boxW = Math.max(44, textW + boxPadX * 2);
      const boxX = selectedCenterX - boxW / 2;

      // 白底
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      roundRect(ctx, boxX, boxY, boxW, boxH, 6);
      ctx.fill();

      // 黑字
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, selectedCenterX, boxY + boxH / 2 + 0.5);

      ctx.restore();
    }
  }

  ctx.restore();
}

function getHotbarIcon(src) {
  if (!src) return null;

  const cached = hotbarIconCache.get(src);
  if (cached) return cached;

  const img = new Image();
  img.src = src;
  img.onload = () => {
    // no-op: complete/naturalWidth will be valid
  };
  img.onerror = () => {
    console.error("hotbar icon load failed:", src);
  };

  hotbarIconCache.set(src, img);
  return img;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
function drawActionBar() {
  if (!ctx || !canvas) return;

  const bar = window.__actionBar;
  if (!bar || bar.active !== true) return;

  const p = Math.max(0, Math.min(1, typeof bar.progress === "number" ? bar.progress : 0));
  const label = (typeof bar.label === "string") ? bar.label : "";
  const cancelText = (typeof bar.cancelText === "string" && bar.cancelText.length > 0)
    ? bar.cancelText
    : "X 取消動作";

  // 位置：中間偏下，並且在快捷欄上方
  const hotbarY = canvas.height - 34 - 44; // padBottom=34, size=44（跟 drawHotbar 一致）
  const centerX = canvas.width / 2 + 60;  // 跟快捷欄同樣向右偏移

  const barW = 180;
  const barH = 9;
  const barX = centerX - barW / 2;
  const barY = Math.min(hotbarY - 26, canvas.height * 0.72); // 盡量落在快捷欄上方

  const radius = 8;

  ctx.save();

  // ===== 底框（暗底） =====
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  roundRect(ctx, barX, barY, barW, barH, radius);
  ctx.fill();

  // ===== 霓虹藍白藍進度條 =====
  if (p > 0) {
    const w = Math.max(2, barW * p);

    // 外藍光
    ctx.save();
    ctx.shadowColor = "rgba(0, 180, 255, 0.75)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(0, 140, 255, 0.85)";
    roundRect(ctx, barX, barY, w, barH, radius);
    ctx.fill();
    ctx.restore();

    // 中白亮帶（讓它看起來像霓虹）
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    const innerPad = 2;
    const innerH = Math.max(2, barH - innerPad * 2);
    roundRect(ctx, barX + innerPad, barY + innerPad, Math.max(0, w - innerPad * 2), innerH, radius - 2);
    ctx.fill();
    ctx.restore();

    // 內藍邊（讓白帶不會太平）
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "rgba(0, 160, 255, 0.95)";
    ctx.lineWidth = 2;
    roundRect(ctx, barX + 0.5, barY + 0.5, w - 1, barH - 1, radius);
    ctx.stroke();
    ctx.restore();
  }

  // =====（可選）上方 label =====
  if (label) {
    ctx.save();
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillText(label, centerX, barY - 8);
    ctx.restore();
  }

  // ===== 下方取消提示 =====
  ctx.save();
  ctx.font = "13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // 文字底框（淡白）
  const padX = 10;
  const padY = 6;
  const tw = ctx.measureText(cancelText).width;
  const boxW = Math.max(88, tw + padX * 2);
  const boxH = 22;
  const boxX = centerX - boxW / 2;
  const boxY = barY + barH + 10;

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  roundRect(ctx, boxX, boxY, boxW, boxH, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
  ctx.fillText(cancelText, centerX, boxY + (boxH - 13) / 2 + 1);
  ctx.restore();

  ctx.restore();
}