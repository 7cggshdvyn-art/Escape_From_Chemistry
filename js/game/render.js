// js/game/render.js
let canvas, ctx;
let arrowImg;
let ready = false;

// 鼠标坐标（相对 canvas）
let mouseX = 0;
let mouseY = 0;
let hasMouse = false;

// 你把箭头图片放到这个路径（你之后自己改也行）
const ARROW_SRC = "images/character/arrow.png";

export function initRender() {
  // 找 canvas
  canvas = document.getElementById("game-canvas");

  // 如果你还没放 canvas，我这里会直接报错提示
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
    ready = true;
    console.log("arrow image loaded:", ARROW_SRC);
  };
  arrowImg.onerror = () => {
    console.error("箭头图片加载失败，检查路径：", ARROW_SRC);
  };

  // 显示画布（如果你一开始隐藏它）
  canvas.style.display = "block";

  // 记录鼠标位置（相对 canvas）
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    hasMouse = true;
  });

  // 鼠标离开画布时，不更新角度（保持最后一次朝向）
  canvas.addEventListener("mouseleave", () => {
    hasMouse = false;
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
  ctx.fillStyle = "#0b0f14";
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

  if (ready) {
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
}