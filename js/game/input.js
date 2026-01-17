// js/game/input.js
export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

// ===== 射击 / 瞄准状态（供 render/game 共用） =====
window.__firing = false; // 相当于「滑鼠左键按住」
window.__aiming = false; // 相当于「滑鼠右键按住」
// 只有進入遊戲後才允許用 ESC 或 / 切換 UI focus
window.__gameStarted = false;


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
    window.__firing = false;
    window.__aiming = false;
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

  return null;
}

window.addEventListener("keydown", (e) => {
  // ESC 或 / ：切换 UI / 暂停状态（iPad Safari 的 ESC 可能会退出浏览器）
  if (e.key === "Escape" || e.key === "/" || e.code === "Slash") {
    // 主畫面/選單階段不處理，避免游標狀態抖動
    if (!window.__gameStarted) return;

    toggleUIFocus();
    e.preventDefault();
    return;
  }

  // 方向键：ArrowLeft=开火（等同滑鼠左键），ArrowRight=瞄准（等同滑鼠右键）
  if (!uiFocus) {
    if (e.key === "ArrowLeft") {
      window.__firing = true;
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowRight") {
      window.__aiming = true;
      e.preventDefault();
      return;
    }
  }

  if (uiFocus) return;

  const dir = mapKeyToDir(e.key);
  if (!dir) return;

  keys[dir] = true;

}, { passive: false });

window.addEventListener("keyup", (e) => {
  // 方向键：放开时复位
  if (e.key === "ArrowLeft") {
    window.__firing = false;
    e.preventDefault();
    return;
  }
  if (e.key === "ArrowRight") {
    window.__aiming = false;
    e.preventDefault();
    return;
  }

  if (uiFocus) return;

  const dir = mapKeyToDir(e.key);
  if (!dir) return;

  keys[dir] = false;

}, { passive: false });

// 切出网页时清空按键并强制进入 UI 模式（避免卡键）
window.addEventListener("blur", () => {
  keys.up = keys.down = keys.left = keys.right = false;

  // 切出网页时强制进入 UI 模式
  setUIFocus(true);
});

// ===== 右键瞄准（ADS） =====
window.addEventListener("contextmenu", (e) => {
  // 阻止右键菜单
  e.preventDefault();
});

// ===== 左键射击（同步到 __firing） =====
window.addEventListener("mousedown", (e) => {
  if (e.button === 0 && !uiFocus) {
    window.__firing = true;
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    window.__firing = false;
  }
});

window.addEventListener("mousedown", (e) => {
  // 右键按下 → 进入瞄准
  if (e.button === 2 && !uiFocus) {
    window.__aiming = true;
  }
});

window.addEventListener("mouseup", (e) => {
  // 右键松开 → 退出瞄准
  if (e.button === 2) {
    window.__aiming = false;
  }
});