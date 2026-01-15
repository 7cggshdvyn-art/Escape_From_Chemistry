// js/game/render.js
let canvas, ctx;
let arrowImg;
let arrowReady = false;

let crosshairImg;
let crosshairReady = false;

// 鼠标坐标
let mouseX = 0;
let mouseY = 0;
let hasMouse = false;

// 箭头路径
const ARROW_SRC = "images/character/arrow.png";

const CROSSHAIR_SRC = "images/on-go/aim-cross.png";

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

  // 载入准星图片
  crosshairImg = new Image();
  crosshairImg.src = CROSSHAIR_SRC;
  crosshairImg.onload = () => {
    crosshairReady = true;
    console.log("crosshair image loaded:", CROSSHAIR_SRC);
  };
  crosshairImg.onerror = () => {
    console.error("准星图片加载失败，检查路径：", CROSSHAIR_SRC);
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
}

export function renderFrame(player) {
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
  // 画准星：跟着鼠标位置（相对 canvas 的 screen 坐标）
  if (hasMouse) {
    const cw = 32;
    const ch = 32;

    if (crosshairReady) {
      ctx.save();
      // 以中心点绘制准星
      ctx.drawImage(crosshairImg, mouseX - cw / 2, mouseY - ch / 2, cw, ch);
      ctx.restore();
    } else {
      // 图片还没加载好，先画个十字占位
      ctx.save();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mouseX - 10, mouseY);
      ctx.lineTo(mouseX + 10, mouseY);
      ctx.moveTo(mouseX, mouseY - 10);
      ctx.lineTo(mouseX, mouseY + 10);
      ctx.stroke();
      ctx.restore();
    }
  }
}