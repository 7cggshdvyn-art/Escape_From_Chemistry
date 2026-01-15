import { player } from "./player.js";
import { initRender, renderFrame } from "./render.js";
import rifleData from "../data/data_rifle.js";
import { isUIFocus } from "./input.js";

let running = false;

// ===== Rifle system (shared by all rifles) =====
function getRifleDefById(id) {
  return rifleData.find(w => w.id === id) ?? null;
}

function createWeaponInstance(def) {
  const s = def.stats;
  return {
    def,
    ammoInMag: s.magSize,
    isReloading: false,
    reloadEndAt: 0,
    lastShotAt: 0,
  };
}

function shotIntervalMs(fireRate) {
  return fireRate > 0 ? 1000 / fireRate : 999999;
}

let mouseX = 0;
let mouseY = 0;
let hasMouse = false;
let isMouseDown = false;

export function startGame() {
  if (running) return;
  running = true;

  console.log("start game");

  // 初始化画面（canvas、贴图等）
  initRender();

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMouse = true;
  });

  window.addEventListener("mousedown", (e) => {
    if (e.button === 0) isMouseDown = true;
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) isMouseDown = false;
  });

  equipRifle(player, "AK-47");

  requestAnimationFrame(loop);
}

function equipRifle(player, rifleId) {
  const def = getRifleDefById(rifleId);
  if (!def) {
    console.error("Rifle not found:", rifleId);
    return;
  }
  player.weapon = createWeaponInstance(def);
}

function tryFire(player, now) {
  if (isUIFocus()) return;
  if (!isMouseDown || !hasMouse) return;

  const w = player.weapon;
  if (!w || w.isReloading) return;

  const s = w.def.stats;
  const interval = shotIntervalMs(s.fireRate);
  if (now - w.lastShotAt < interval) return;

  if (w.ammoInMag <= 0) {
    startReload(w, s);
    return;
  }

  w.ammoInMag--;
  w.lastShotAt = now;

  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  player.angle = Math.atan2(dy, dx);

  console.log("FIRE", w.def.id, "ammo", w.ammoInMag);
}

function startReload(w, s) {
  if (w.isReloading) return;
  w.isReloading = true;
  w.reloadEndAt = performance.now() + s.reloadTime * 1000;
}

function updateReload(player, now) {
  const w = player.weapon;
  if (!w || !w.isReloading) return;

  if (now >= w.reloadEndAt) {
    w.isReloading = false;
    w.ammoInMag = w.def.stats.magSize;
  }
}

function loop() {
  const now = performance.now();

  player.update();

  updateReload(player, now);
  tryFire(player, now);

  // 每帧渲染（把玩家画出来）
  renderFrame(player);

  requestAnimationFrame(loop);
}