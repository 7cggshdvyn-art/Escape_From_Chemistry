import { isUIFocus } from "./input.js";
let canvas, ctx;
let arrowImg;
let arrowReady = false;

let crossUpImg, crossDownImg, crossLeftImg, crossRightImg, crossDotImg;
let crossUpReady = false;
let crossDownReady = false;
let crossLeftReady = false;
let crossRightReady = false;
let crossDotReady = false;


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
    const cx = mouseX;
    const cy = mouseY;

    // 之后要做动画会用到：gap 控制四段离中心的距离
    const gapHip = 10; // 腰射间距
    const gapAds = 6;  // 瞄准间距（更紧）

    const aiming = window.__aiming === true;
    const gap = aiming ? gapAds : gapHip;

    // 你的素材是 1024x1024，大幅縮小會讓細線被抗鋸齒吃掉，所以先用大一點的顯示尺寸
    const segW = 24;
    const segH = 24;

    const dotW = 4;
    const dotH = 4;

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

    // 中点：只有瞄准才画
    if (aiming) {
      if (crossDotReady) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(crossDotImg, cx - dotW / 2, cy - dotH / 2, dotW, dotH);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}