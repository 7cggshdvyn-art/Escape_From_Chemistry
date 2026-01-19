// js/game/input.js
export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  shift: false, // 跑步（按住）
};

// ===== 射击 / 瞄准状态（供 render/game 共用） =====
window.__firing = false; // 相当于「滑鼠左键按住」
window.__aiming = false; // 相当于「滑鼠右键按住」

// ===== 射击锁：用于「按住左键时开镜会取消射击，需重新按下才可继续」 =====
window.__fireLock = false;

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
    keys.up = keys.down = keys.left = keys.right = keys.shift = false;
    window.__firing = false;
    window.__aiming = false;
    window.__fireLock = false;
    window.__actionCancelRequested = false;
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
  const cur = cursorVisible ? "default" : "none";

  // body 游標只是預設值；實際在 canvas 上會被 canvas 的 cursor 覆蓋
  document.body.style.cursor = cur;

  // 同步 canvas，避免「畫面上還看到滑鼠」
  const canvas = document.getElementById("game-canvas");
  if (canvas) {
    canvas.style.cursor = cur;
  }
}

// 初始化时隐藏鼠标
updateCursor();

// ===== 快捷欄（1~8 & V） =====
// 1~8 = 槍械/物品槽；0 = 近戰（V）
window.__hotbarSelected = 1;

// ===== 換彈請求（一次性） =====
// game.js 會在每幀讀取並消耗它
window.__reloadRequested = false;

// ===== 翻滾請求（一次性） =====
// game.js 會在每幀讀取並消耗它
window.__rollRequested = false;

// ===== 取消動作請求（一次性） =====
// game.js 會在每幀讀取並消耗它
window.__actionCancelRequested = false;

// 開鏡過程判定：render.js 會同步 window.__aimProgress（0~1）
function isAimingTransition() {
  const ap = window.__aimProgress ?? 0;
  return (window.__aiming === true) && (ap < 0.85);
}

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
      // 開鏡「途中」不允許射擊；開鏡完成後允許 ADS 射擊
      // 且若被鎖住必須重新按下
      if (isAimingTransition() || window.__fireLock === true) {
        window.__firing = false;
        e.preventDefault();
        return;
      }
      window.__firing = true;
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowRight") {
      // 開鏡時強制取消射擊；若原本在射擊，需重新按下才可再射
      if (window.__firing === true) {
        window.__fireLock = true;
      }
      window.__firing = false;
      window.__aiming = true;
      e.preventDefault();
      return;
    }
  }

  // X：取消目前動作（一次性觸發）
  if (e.key === "x" || e.key === "X") {
    if (!e.repeat) {
      window.__actionCancelRequested = true;
    }
    e.preventDefault();
    return;
  }

  // 快捷欄切換：1~8 與 V（近戰）
  if (!uiFocus) {
    // 数字键 1~8
    if (e.key >= "1" && e.key <= "8") {
      window.__hotbarSelected = Number(e.key);
      e.preventDefault();
      return;
    }

    // V：近战预留位
    if (e.key === "v" || e.key === "V") {
      window.__hotbarSelected = 0;
      e.preventDefault();
      return;
    }
  }

  // R：換彈（一次性請求）
  if (!uiFocus && (e.key === "r" || e.key === "R")) {
    window.__reloadRequested = true;
    e.preventDefault();
    return;
  }

  // Shift：跑步（按住）
  if (!uiFocus && (e.key === "Shift")) {
    keys.shift = true;
    e.preventDefault();
    return;
  }

  // Space：翻滾（一次性觸發，按住不連發）
  if (!uiFocus && (e.code === "Space" || e.key === " ")) {
    if (!e.repeat) {
      window.__rollRequested = true;
    }
    e.preventDefault();
    return;
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
    // 放開後解除射擊鎖，下一次按下才會開火
    window.__fireLock = false;
    e.preventDefault();
    return;
  }
  if (e.key === "ArrowRight") {
    window.__aiming = false;
    e.preventDefault();
    return;
  }

  // Shift：放開停止跑步
  if (e.key === "Shift") {
    keys.shift = false;
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
  keys.up = keys.down = keys.left = keys.right = keys.shift = false;
  window.__actionCancelRequested = false;

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
    // 開鏡「途中」不允許射擊；開鏡完成後允許 ADS 射擊
    // 且若被鎖住必須重新按下
    if (isAimingTransition() || window.__fireLock === true) {
      window.__firing = false;
      return;
    }
    window.__firing = true;
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    window.__firing = false;
    // 放開後解除射擊鎖，下一次按下才會開火
    window.__fireLock = false;
  }
});

window.addEventListener("mousedown", (e) => {
  // 右键按下 → 进入瞄准
  if (e.button === 2 && !uiFocus) {
    // 開鏡時強制取消射擊；若原本在射擊，需重新按下才可再射
    if (window.__firing === true) {
      window.__fireLock = true;
    }
    window.__firing = false;
    window.__aiming = true;
  }
});

window.addEventListener("mouseup", (e) => {
  // 右键松开 → 退出瞄准
  if (e.button === 2) {
    window.__aiming = false;
  }
});