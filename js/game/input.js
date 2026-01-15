// js/game/input.js
export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

// ===== UI / 暂停状态 =====
let uiFocus = false; // true = 选单/ESC状态，角色不可移动

export function isUIFocus() {
  return uiFocus;
}

export function setUIFocus(state) {
  uiFocus = state;

  // 进入 UI 时：清空移动键，避免松不开
  if (uiFocus) {
    keys.up = keys.down = keys.left = keys.right = false;
  }

  // UI 时显示鼠标，游戏时隐藏鼠标
  cursorVisible = uiFocus;
  updateCursor();
}

export function toggleUIFocus() {
  setUIFocus(!uiFocus);
}

// ===== 鼠标显示 / 隐藏控制 =====
let cursorVisible = false; // 初始隐藏鼠标

function updateCursor() {
  document.body.style.cursor = cursorVisible ? "default" : "none";
}

// 初始化时隐藏鼠标
updateCursor();

// 把各种键名统一映射成 up/down/left/right
function mapKeyToDir(key) {
  // WASD
  if (key === "w" || key === "W") return "up";
  if (key === "s" || key === "S") return "down";
  if (key === "a" || key === "A") return "left";
  if (key === "d" || key === "D") return "right";

  // 方向键（你不想要就把这段删掉）
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";

  return null;
}

window.addEventListener("keydown", (e) => {
  // ESC：切换 UI / 暂停状态
  if (e.key === "Escape") {
    toggleUIFocus();
    e.preventDefault();
    return;
  }

  if (uiFocus) return;

  const dir = mapKeyToDir(e.key);
  if (!dir) return;

  keys[dir] = true;

  // 防止方向键滚动画面
  if (e.key.startsWith("Arrow")) e.preventDefault();
}, { passive: false });

window.addEventListener("keyup", (e) => {
  if (uiFocus) return;

  const dir = mapKeyToDir(e.key);
  if (!dir) return;

  keys[dir] = false;

  if (e.key.startsWith("Arrow")) e.preventDefault();
}, { passive: false });

// 切出网页时清空按键并强制进入 UI 模式（避免卡键）
window.addEventListener("blur", () => {
  keys.up = keys.down = keys.left = keys.right = false;

  // 切出网页时强制进入 UI 模式
  setUIFocus(true);
});