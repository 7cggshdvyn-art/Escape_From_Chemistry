import { player } from "./player.js";
import { initRender, renderFrame } from "./render.js";
import rifleData from "../data/weapon/rifle/data_rifle.js";

import { isUIFocus, setUIFocus } from "./input.js";
import characterData from "../data/character/data_character.js";

// R 換彈請求（由 input.js 設定）
const getReloadRequested = () => window.__reloadRequested === true;


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
// let isMouseDown = false;  // Removed as per instruction

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
  // 與 input 的選取槽位同步（避免不同步造成誤判）
  if (typeof window.__hotbarSelected === "number") {
    player.activeHotbarSlot = window.__hotbarSelected;
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMouse = true;
  });

  window.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      // 交由 input.js 的 fireLock/aiming 規則控制 __firing
      window.__firing = true;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      window.__firing = false;
    }
  });


  // 根據目前選取的 hotbar slot 裝備武器（先支援 rifle）
  syncEquippedWeaponFromHotbar(player);

  requestAnimationFrame(loop);
}

function getSelectedHotbarSlot(player) {
  const selectedSlot = (typeof window.__hotbarSelected === "number")
    ? window.__hotbarSelected
    : (player.activeHotbarSlot ?? 1);
  return selectedSlot;
}

function syncEquippedWeaponFromHotbar(player) {
  const slot = getSelectedHotbarSlot(player);
  const item = player.inventory?.hotbar?.[slot] ?? null;

  // 沒物品或不是槍：清空目前武器（之後切槍會用到）
  if (!item || item.type !== "rifle") {
    player.weapon = null;
    return;
  }

  // 若 slot 尚未有 instance，就用 id 建立並綁定（保留狀態用）
  if (!item.instance) {
    const def = getRifleDefById(item.id);
    if (!def) {
      console.error("Rifle not found:", item.id);
      player.weapon = null;
      return;
    }
    item.instance = createWeaponInstance(def);
  }

  // 讓 player.weapon 指向該 slot 的 instance
  player.weapon = item.instance;
}

function equipRifle(player, rifleId) {
  const def = getRifleDefById(rifleId);
  if (!def) {
    console.error("Rifle not found:", rifleId);
    return;
  }

  // 盡量把 instance 綁到目前選取的 hotbar 槽位（保留狀態）
  const slot = getSelectedHotbarSlot(player);
  const item = player.inventory?.hotbar?.[slot] ?? null;
  if (item && item.type === "rifle" && item.id === rifleId) {
    if (!item.instance) item.instance = createWeaponInstance(def);
    player.weapon = item.instance;
    return;
  }

  // 兼容：若不是從 hotbar 裝備，仍可直接建立 instance
  player.weapon = createWeaponInstance(def);
}

function tryFire(player, now) {
  // 開鏡進行中不允許射擊；開鏡完成後允許 ADS 射擊
  const ap = window.__aimProgress ?? 0;
  if (window.__aiming === true && ap < 0.85) return;

  const firing = (window.__firing === true);
  if (!firing || !hasMouse) return;

  // 只有當目前選到的快捷欄槽位是槍（rifle）時才允許射擊
  const selectedSlot = (typeof window.__hotbarSelected === "number") ? window.__hotbarSelected : (player.activeHotbarSlot ?? 1);
  const selectedItem = player.inventory?.hotbar?.[selectedSlot] ?? null;
  if (!selectedItem || selectedItem.type !== "rifle") return;

  const w = player.weapon;
  if (!w || w.isReloading) return;

  const s = w.def.stats;
  const interval = shotIntervalMs(s.fireRate);
  if (now - w.lastShotAt < interval) return;

  if (w.ammoInMag <= 0) {
    // 子彈打光：不自動換彈，等待玩家按 R
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

function handleReload(player, now) {
  if (isUIFocus()) return;

  // 先消耗 R 換彈請求：避免在非槍槽位按 R 被「排隊」到之後切回槍才觸發
  if (!getReloadRequested()) return;
  window.__reloadRequested = false;

  // 目前選到的快捷欄必須是槍，才允許換彈
  const selectedSlot = (typeof window.__hotbarSelected === "number") ? window.__hotbarSelected : (player.activeHotbarSlot ?? 1);
  const selectedItem = player.inventory?.hotbar?.[selectedSlot] ?? null;
  if (!selectedItem || selectedItem.type !== "rifle") return;

  const w = player.weapon;
  if (!w || w.isReloading) return;

  const s = w.def.stats;
  if (w.ammoInMag >= s.magSize) return;

  startReload(w, s);
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

  // 依 hotbar 選取同步目前裝備（為未來切槍預留）
  syncEquippedWeaponFromHotbar(player);

  player.update();

  updateReload(player, now);
  handleReload(player, now);
  tryFire(player, now);

  // 每帧渲染（把玩家画出来）
  renderFrame(player, {
    lastShotVisualAt,
    SHOT_FLASH_DURATION
  });

  requestAnimationFrame(loop);
}