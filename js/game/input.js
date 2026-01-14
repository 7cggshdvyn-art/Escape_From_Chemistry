// js/game/input.js
export const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

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
  const dir = mapKeyToDir(e.key);
  if (!dir) return;

  keys[dir] = true;

  // 防止方向键滚动画面
  if (e.key.startsWith("Arrow")) e.preventDefault();
}, { passive: false });

window.addEventListener("keyup", (e) => {
  const dir = mapKeyToDir(e.key);
  if (!dir) return;

  keys[dir] = false;

  if (e.key.startsWith("Arrow")) e.preventDefault();
}, { passive: false });

// 切出网页时清空按键（避免卡键）
window.addEventListener("blur", () => {
  keys.up = keys.down = keys.left = keys.right = false;
});