import { player } from "./player.js";
import { initRender, renderFrame } from "./render.js";
import rifleData from "../data/weapon/rifle/data_rifle.js";
import { isUIFocus, setUIFocus } from "./input.js";
import characterData from "../data/character/data_character.js";


let running = false;

// ===== Inventory / Hotbar (UI will read from here) =====
function createDefaultInventory() {
  return {
    // 1~8：快捷欄；melee：V 近戰預留位
    hotbar: {
      1: { type: "rifle", id: "AK-47", icon: "images/data/weapon/rifle/AK-47.png" },
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      melee: null,
    },
  };
}

// ===== Character data =====
const playerChar = characterData.find(c => c.id === "player");

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

// ===== Shooting visual state =====
export let lastShotVisualAt = 0; // ms
export const SHOT_FLASH_DURATION = 60; // ms

export function startGame() {
  if (running) return;
  running = true;

  console.log("start game");

  // 初始化画面（canvas、贴图等）
  initRender();
  // 進入遊戲時強制回到「遊戲模式」（準星顯示、可移動）
  setUIFocus(false);

  // 初始化玩家物品（hotbar）——UI 會從這裡讀
  if (!player.inventory) {
    player.inventory = createDefaultInventory();
  }
  if (typeof player.activeHotbarSlot !== "number") {
    player.activeHotbarSlot = 1;
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMouse = true;
  });

  window.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      isMouseDown = true;
      window.__firing = true;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      isMouseDown = false;
      window.__firing = false;
    }
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
  const firing = (window.__firing === true) || isMouseDown;
  if (!firing || !hasMouse) return;

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

  // 触发射击视觉（给 render 用）
  lastShotVisualAt = now;

  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  player.angle = Math.atan2(dy, dx);

  if (playerChar && playerChar.combat) {
    // 这里只是预留接口：之后命中计算会用到
    // const dmgMultiplier = playerChar.combat.gunDamageMultiplier;
  }

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
  renderFrame(player, {
    lastShotVisualAt,
    SHOT_FLASH_DURATION
  });

  requestAnimationFrame(loop);
}