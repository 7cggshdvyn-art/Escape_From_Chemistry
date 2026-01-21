import { isUIFocus } from "./input.js";
import { initUI, drawVitals } from "./ui.js";
let canvas, ctx;
let arrowImg;
let arrowReady = false;

// ===== Hotbar icon cache =====
const hotbarIconCache = new Map();


// ===== Crosshair spread animation (gap lerp) =====
let crossGapPx = null; // 當前四段距離（px），用來做平滑動畫

// ===== Independent crosshair (state) =====
let crossX = null;
let crossY = null;

// ===== ADS (aim) timing =====
let aimProgress = 0; // 0~1
let lastRenderAt = 0;

// ===== Recoil visual (crosshair kick) =====
let recoilVisX = 0; // px
let recoilVisY = 0; // px

// 後座力弧度 -> 像素 的縮放（想更明顯就調大）
// 調小 = 準心被後座力推走的距離更短
const RECOIL_VIS_PX_PER_RAD = 50;

// 視覺回正速度（越大回得越快）
const RECOIL_VIS_RETURN = 22;

// 鼠标坐标
let mouseX = 0;
let mouseY = 0;
let hasMouse = true;

// 對外暴露（game.js 仍有使用到）
window.__mouseX = mouseX;
window.__mouseY = mouseY;
window.__hasMouse = hasMouse;

// 箭头路径
const ARROW_SRC = "images/character/arrow.png";


export function initRender() {
  // 找 canvas
  canvas = document.getElementById("game-canvas");

  if (!canvas) {
    console.error('找不到 <canvas id="game-canvas">，请先把 canvas 加到 index.html 里');
    return;
  }

  ctx = canvas.getContext("2d");

  // 初始化 UI（預載水分/體力圖示）
  initUI();

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


  // 显示画布（如果你一开始隐藏它）
  canvas.style.display = "block";

  // 隱藏系統滑鼠游標：我們自己用準心畫出來
  canvas.style.cursor = "none";

  // 记录鼠标位置（相对 canvas）——用 window 监听，避免被菜单层挡住拿不到 mousemove
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    hasMouse = true;

    // 同步給其他模組使用
    window.__mouseX = mouseX;
    window.__mouseY = mouseY;
    window.__hasMouse = hasMouse;
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
  if (crossX == null || crossY == null) {
    crossX = mouseX;
    crossY = mouseY;
  }
  window.__mouseX = mouseX;
  window.__mouseY = mouseY;
  window.__hasMouse = hasMouse;
}

export function renderFrame(player, fireVisual = {}) {
  const {
    lastShotVisualAt = 0,
    SHOT_FLASH_DURATION = 0,
  } = fireVisual;

  // ↓↓↓ 你原本 renderFrame 裡面的所有畫圖程式碼都要留在這裡（不要跑到函數外）
  if (!ctx) return;

  // UI 介面打開時要看到系統游標；遊戲中則隱藏
  canvas.style.cursor = isUIFocus() ? "default" : "none";

  // 清画面
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景（先随便填一个暗色，之后你可以换成地图）
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const inventoryOpen = (window.__uiPanel === "inventory");

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

  // ===== 敵人（測試） =====
  // 由 game.js 提供：window.__enemies = [Enemy, ...]
  const enemies = Array.isArray(window.__enemies) ? window.__enemies : [];
  drawEnemies(enemies);

  // Inventory 打開時：世界仍照畫，但 UI（準心/HUD/hotbar/action bar）要隱藏
  if (inventoryOpen) {
    drawInventoryLeftPanel();
    return;
  }

  // ===== 射击可视化：只在「射击瞬间」闪现 =====
  const now = performance.now();
  if (!isUIFocus() && hasMouse && (now - lastShotVisualAt < SHOT_FLASH_DURATION)) {
    // 子彈/激光可視化：指向「準心中心」，不是原始鼠標位置
    const aimX = (crossX == null ? mouseX : crossX) + recoilVisX;
    const aimY = (crossY == null ? mouseY : crossY) + recoilVisY;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(aimX, aimY);
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

    // 目標偏移（px）：把後座力座標系跟著瞄準方向旋轉
    // pitch：沿著瞄準方向（aim）
    // yaw：垂直於瞄準方向（perp）=> 你要的「水平後座力」會隨滑鼠方向改變
    const ang = (typeof player?.angle === "number") ? player.angle : angle;
    const ax = Math.cos(ang);
    const ay = Math.sin(ang);
    const px = -ay;
    const py = ax;
    // 視覺比例：水平後座力約為垂直的 20%
    const pitchPx = recoilPitch * RECOIL_VIS_PX_PER_RAD;
    const yawPx = recoilYaw * RECOIL_VIS_PX_PER_RAD * 0.2;

    const targetRecoilX = ax * pitchPx + px * yawPx;
    const targetRecoilY = ay * pitchPx + py * yawPx;

    // 平滑：避免每發跳動太生硬（dt 已在上面算好，單位秒）
    if (dt > 0) {
      const k = Math.min(1, dt * RECOIL_VIS_RETURN);
      recoilVisX += (targetRecoilX - recoilVisX) * k;
      recoilVisY += (targetRecoilY - recoilVisY) * k;
    } else {
      recoilVisX = targetRecoilX;
      recoilVisY = targetRecoilY;
    }

    // ===== 獨立準星（state） =====
    // 第一次進來先把準星放在滑鼠位置
    if (crossX == null || crossY == null) {
      crossX = mouseX;
      crossY = mouseY;
    }

    // 滑鼠只是在「拉回」準星，不是直接等於準星
    // 係數越小越難壓（準星更有慣性）
    const aimingRaw = window.__aiming === true;
    const follow = aimingRaw ? 0.14 : 0.22;
    crossX += (mouseX - crossX) * follow;
    crossY += (mouseY - crossY) * follow;

    // 你真正看到的準心中心點（獨立準星 + 後座力偏移）
    const cx = crossX + recoilVisX;
    const cy = crossY + recoilVisY;

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
    const crossScale = 0.9; // 全局縮放倍率

    // ===== 用 Canvas 畫準心（不依賴圖片） =====
    // 線段長度/粗細跟 crossScale 同步
    const segLen = 14 * crossScale;
    const innerPad = 4 * crossScale; // 線段離中心的最小間距（再加上 gap）
    const lw = Math.max(1.5, 2.2 * crossScale);

    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = lw;
    ctx.lineCap = "round";

    ctx.beginPath();
    // 上
    ctx.moveTo(cx, cy - gap - innerPad - segLen);
    ctx.lineTo(cx, cy - gap - innerPad);
    // 下
    ctx.moveTo(cx, cy + gap + innerPad);
    ctx.lineTo(cx, cy + gap + innerPad + segLen);
    // 左
    ctx.moveTo(cx - gap - innerPad - segLen, cy);
    ctx.lineTo(cx - gap - innerPad, cy);
    // 右
    ctx.moveTo(cx + gap + innerPad, cy);
    ctx.lineTo(cx + gap + innerPad + segLen, cy);

    ctx.stroke();
    ctx.restore();

    // 右鍵瞄準完成後才顯示中心點（腰射不畫）
    if (aiming) {
      ctx.save();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2 * crossScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ===== 底部快捷欄（1 2 V 3 4 5 6 7 8） =====
  drawHotbar(player);
  // ===== 水分/體力圓環（在快捷欄 1 左邊） =====
{
  const size = 44;
  const gap = 10;
  const padBottom = 34;

  // 9 格（1,2,V,3,4,5,6,7,8）
  const totalW = 9 * size + 8 * gap;
  const startX = (canvas.width - totalW) / 2 + 120;
  const y = canvas.height - padBottom - size;

  // slot 1 是第一格
  const slot1X = startX;
  const slot1CenterY = y + size / 2;

  // 兩個圓放在 slot1 左邊
  const anchorX = slot1X - 100; // 往左搬（數字越大越靠左）

  drawVitals(ctx, anchorX, slot1CenterY, {
    // Health（優先用 player 的實際值；沒有就回退到 window 變數）
    health: (typeof player?.hp === "number")
      ? player.hp
      : ((typeof window.__health === "number") ? window.__health : 100),
    healthMax: (typeof player?.maxHp === "number" && player.maxHp > 0)
      ? player.maxHp
      : ((typeof window.__healthMax === "number" && window.__healthMax > 0) ? window.__healthMax : 100),

    hydration: (typeof window.__hydration === "number") ? window.__hydration : 100,
    hydrationMax: (typeof window.__hydrationMax === "number") ? window.__hydrationMax : 100,
    stamina: (typeof window.__stamina === "number") ? window.__stamina : 100,
    staminaMax: (typeof window.__staminaMax === "number") ? window.__staminaMax : 100,
    radius: 18,
    gap: 28,
  });
}

  // ===== 通用動作進度條（換彈/互動等共用） =====
  drawActionBar();
}


function drawEnemies(enemies) {
  if (!ctx) return;

  for (const e of enemies) {
    if (!e || e.alive === false) continue;

    const ex = typeof e.x === "number" ? e.x : 0;
    const ey = typeof e.y === "number" ? e.y : 0;

    // ===== 身體（先用圓形占位） =====
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.arc(ex, ey, 18, 0, Math.PI * 2);
    ctx.fill();

    // ===== 頭（小圓，之後命中判定可用） =====
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath();
    ctx.arc(ex, ey - 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // ===== 血條：在敵人上方 =====
    const maxHp = (typeof e.maxHp === "number" && e.maxHp > 0) ? e.maxHp : 100;
    const hp = (typeof e.hp === "number") ? e.hp : maxHp;
    const ratio = Math.max(0, Math.min(1, hp / maxHp));

    const barW = 44;
    const barH = 6;
    const barX = ex - barW / 2;
    const barY = ey - 18 - 18; // 身體半徑 18，再往上 18px

    // 底
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(barX, barY, barW, barH);

    // 血
    ctx.fillStyle = "rgba(0, 170, 0, 0.85)";
    ctx.fillRect(barX, barY, barW * ratio, barH);

    // 外框
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1);

    ctx.restore();
  }
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

// 右側欄位下方小圖示（路徑你之後自己換）
const INV_RIGHT_ICON_SRC = "images/ui/backpack/icon_safe.png";
let invRightIconImg = null;
let invRightIconReady = false;
function ensureInvRightIconLoaded() {
  if (invRightIconImg) return;
  invRightIconImg = new Image();
  invRightIconImg.src = INV_RIGHT_ICON_SRC;
  invRightIconImg.onload = () => (invRightIconReady = true);
  invRightIconImg.onerror = () => {
    console.warn("inventory right icon load failed:", INV_RIGHT_ICON_SRC);
  };
}

function drawInventoryLeftPanel() {
  ensureInvRightIconLoaded();

  const panelX = 24;
  const panelY = 24;
  const panelW = Math.min(460, canvas.width * 0.40);
  const panelH = canvas.height - panelY * 2;

  ctx.save();

  // ===== Panel background（統一淡藍色） =====
  ctx.fillStyle = "rgba(90, 160, 210, 0.22)";
  roundRect(ctx, panelX, panelY, panelW, panelH, 14);
  ctx.fill();

  // ===== Layout split =====
  const padding = 16;
  const innerX = panelX + padding;
  const innerY = panelY + padding;
  const innerW = panelW - padding * 2;

  // 右側欄（兩個獨立格子）
  const rightColW = 92; // 縮到剛好包住右側大格
  const gutter = 8;     // 更貼近裝備區
  const leftW = innerW - rightColW - gutter;
  const rightX = innerX + leftW + gutter;

  // Equipment (left/top)
  const equipH = 190; // 兩排裝備 + 內建標題區
  drawInventorySection(innerX, innerY, leftW, equipH, "裝備");

  // Right column aligned to equipment top
  drawInventoryRightColumn(rightX, innerY, rightColW, equipH);

  // Backpack (left/bottom)
  const gap = 22; // 裝備/背包之間留空隙
  const bagY = innerY + equipH + gap;
  const bagH = panelH - padding * 2 - equipH - gap;
  drawInventoryBackpack(innerX, bagY, leftW, bagH);

  ctx.restore();
}

function drawInventoryRightColumn(x, y, w, equipH) {
  ctx.save();

  const slotW = w - 28;
  const slotH = 68; // smaller
  const slotX = x + (w - slotW) / 2;
  const topPad = 10;
  const vGap = 10;

  const s1Y = y + topPad;
  const s2Y = s1Y + slotH + vGap;

  for (const sy of [s1Y, s2Y]) {
    ctx.fillStyle = "rgba(90, 160, 210, 0.22)";
    roundRect(ctx, slotX, sy, slotW, slotH, 14);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, slotX + 0.5, sy + 0.5, slotW - 1, slotH - 1, 14);
    ctx.stroke();
  }

  // Small icon under the two slots
  const iconSize = 20;
  const iconX = x + w / 2 - iconSize / 2;
  const iconY = s2Y + slotH + 8;

  if (invRightIconImg && invRightIconReady && invRightIconImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(invRightIconImg, iconX, iconY, iconSize, iconSize);
    ctx.restore();
  }

  ctx.restore();
}

function drawInventorySection(x, y, w, h, title) {
  ctx.save();

  // Box（淡藍，統一色）
  ctx.fillStyle = "rgba(90, 160, 210, 0.22)";
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();

  // Box border
  ctx.strokeStyle = "rgba(180, 230, 255, 0.22)";
  ctx.lineWidth = 2;
  roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14);
  ctx.stroke();

  // Header（預留文字區）
  const headerH = 28;
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  roundRect(ctx, x + 8, y + 8, w - 16, headerH, 12);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = "15px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(title, x + 18, y + 8 + headerH / 2);

  // Equipment slots：5 欄 x 2 排
  const cols = 5;
  const rows = 2;
  const size = 54;
  const gap = 6;

  const gridW = cols * size + (cols - 1) * gap;
  const startX = x + (w - gridW) / 2;
  let sy = y + 8 + headerH + 10;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = startX + c * (size + gap);
      ctx.fillStyle = "rgba(90, 160, 210, 0.22)";
      roundRect(ctx, sx, sy, size, size, 14);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, sx + 0.5, sy + 0.5, size - 1, size - 1, 14);
      ctx.stroke();
    }
    sy += size + gap;
  }

  ctx.restore();
}

function drawInventoryBackpack(x, y, w, h) {
  ctx.save();

  // Header（預留文字區）
  const headerH = 28;
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  roundRect(ctx, x + 8, y + 8, w - 16, headerH, 12);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = "15px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("背包", x + 18, y + 8 + headerH / 2);

  // ===== Visible grid: 5 x 5 =====
  const cols = 5;
  const rows = 5;
  const size = 54;
  const gap = 6;

  const gridW = cols * size + (cols - 1) * gap;
  const startX = x + (w - gridW) / 2;
  let sy = y + 8 + headerH + 12;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = startX + c * (size + gap);
      ctx.fillStyle = "rgba(90, 160, 210, 0.22)";
      roundRect(ctx, sx, sy, size, size, 14);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, sx + 0.5, sy + 0.5, size - 1, size - 1, 14);
      ctx.stroke();
    }
    sy += size + gap;
  }

  ctx.restore();
}