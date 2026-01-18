import { player } from "./player.js";
import { initRender, renderFrame } from "./render.js";
import rifleData from "../data/weapon/rifle/data_rifle.js";

import { isUIFocus, setUIFocus, keys } from "./input.js";
import characterData from "../data/character/data_character.js";

// R 換彈請求（由 input.js 設定）
const getReloadRequested = () => window.__reloadRequested === true;


let running = false;
let lastFrameAt = 0;

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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// 在半徑 r 的圓內取均勻隨機點（避免集中在外圈）
function randomPointInCircle(r) {
  if (r <= 0) return { x: 0, y: 0 };
  const a = Math.random() * Math.PI * 2;
  const u = Math.random();
  const rr = Math.sqrt(u) * r;
  return { x: Math.cos(a) * rr, y: Math.sin(a) * rr };
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

  // ===== 套用角色基礎移動參數（來自 data_character.js） =====
  if (playerChar && playerChar.movement) {
    if (typeof playerChar.movement.walkSpeed === "number") player.walkSpeed = playerChar.movement.walkSpeed;
    if (typeof playerChar.movement.runSpeed === "number") player.runSpeed = playerChar.movement.runSpeed;
    if (typeof playerChar.movement.rollDistance === "number") player.rollDistance = playerChar.movement.rollDistance;
  }
  // 翻滾時間先固定 0.8s（之後你要做角色差異再改）
  player.rollDuration = 0.8;

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
  const selectedSlot = getSelectedSlotIndex(player);
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

  // ===== 真正的散布：射擊方向會依 hipSpread/aimSpread 隨機偏移 =====
  // 注意：這裡先用「像素半徑」理解 spread（之後你要改成角度制也很容易）
  const baseDx = mouseX - player.x;
  const baseDy = mouseY - player.y;
  const baseAngle = Math.atan2(baseDy, baseDx);

  const sHip = (typeof s.hipSpread === "number") ? s.hipSpread : 0;
  const sAim = (typeof s.aimSpread === "number") ? s.aimSpread : 0;

  // 開鏡進度（0~1）用來讓散布從 hip → aim 平滑過渡
  const ap2 = window.__aimProgress ?? 0;
  const t = Math.max(0, Math.min(1, ap2));
  const spreadRadius = lerp(sHip, sAim, t);

  // 對滑鼠目標點做隨機偏移（像素）
  const off = randomPointInCircle(spreadRadius);
  const targetX = mouseX + off.x;
  const targetY = mouseY + off.y;

  const shotDx = targetX - player.x;
  const shotDy = targetY - player.y;
  const shotAngle = Math.atan2(shotDy, shotDx);

  // 角色面向仍然跟著滑鼠（手感比較直覺）；子彈方向用 shotAngle
  player.angle = baseAngle;

  // 先把射擊用的角度/目標點暴露出去（之後你想讓紅線顯示散布就能直接用）
  window.__lastShotAngle = shotAngle;
  window.__lastShotTargetX = targetX;
  window.__lastShotTargetY = targetY;

  if (playerChar && playerChar.combat) {
    // 这里只是预留接口：之后命中计算会用到
    // const dmgMultiplier = playerChar.combat.gunDamageMultiplier;
  }

  console.log("FIRE", w.def.id, "ammo", w.ammoInMag, "shotAngle", shotAngle);
}


function startReload(w, s, reloadSlot) {
  if (w.isReloading) return;
  w.isReloading = true;
  w.reloadEndAt = performance.now() + s.reloadTime * 1000;
  w.reloadSlot = reloadSlot;
}

function getSelectedSlotIndex(player) {
  return (typeof window.__hotbarSelected === "number") ? window.__hotbarSelected : (player.activeHotbarSlot ?? 1);
}

// 只允許在「走路狀態」不中斷換彈：其餘任何狀態都會中斷
function isReloadWalkOnlyState(player) {
  if (isUIFocus()) return false;

  // 翻滾/跑步/射擊/瞄準 都視為非走路狀態
  if (player.isRolling === true) return false;
  if (keys.shift === true) return false;
  if (window.__firing === true) return false;
  if (window.__aiming === true) return false;

  // 切換快捷欄（或不再是槍）也屬於非走路狀態
  const slot = getSelectedSlotIndex(player);
  const item = player.inventory?.hotbar?.[slot] ?? null;
  if (!item || item.type !== "rifle") return false;

  // 若換彈是從某個槽位開始，期間換了槽位也要中斷
  const w = player.weapon;
  if (w && w.isReloading && typeof w.reloadSlot === "number" && w.reloadSlot !== slot) return false;

  return true;
}

function cancelReload(w) {
  if (!w) return;
  w.isReloading = false;
  w.reloadEndAt = 0;
  // reloadSlot 用來偵測是否切換了快捷欄
  w.reloadSlot = undefined;
}

function handleReload(player, now) {
  if (isUIFocus()) return;

  // 先消耗 R 換彈請求：避免在非槍槽位按 R 被「排隊」到之後切回槍才觸發
  if (!getReloadRequested()) return;
  window.__reloadRequested = false;

  const selectedSlot = getSelectedSlotIndex(player);
  const selectedItem = player.inventory?.hotbar?.[selectedSlot] ?? null;
  if (!selectedItem || selectedItem.type !== "rifle") return;

  const w = player.weapon;

  // 只有在「走路狀態」才允許開始換彈
  if (!isReloadWalkOnlyState(player)) return;

  if (!w || w.isReloading) return;

  const s = w.def.stats;
  if (w.ammoInMag >= s.magSize) return;

  startReload(w, s, selectedSlot);
}

function handleRoll(player) {
  // 先消耗翻滾請求，避免「排隊」到之後才觸發
  if (window.__rollRequested !== true) return;
  window.__rollRequested = false;

  if (isUIFocus()) return;

  // 以當下移動方向為主；沒方向就交給 player.startRoll 用角色朝向
  let dx = 0;
  let dy = 0;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;

  player.startRoll(dx, dy);
}

function updateReload(player, now) {
  const w = player.weapon;
  if (!w || !w.isReloading) return;

  // 換彈只允許在走路狀態不中斷；其餘狀態一律中斷
  if (!isReloadWalkOnlyState(player)) {
    cancelReload(w);
    return;
  }

  if (now >= w.reloadEndAt) {
    w.isReloading = false;
    w.reloadSlot = undefined;
    w.ammoInMag = w.def.stats.magSize;
  }
}

function loop() {
  const now = performance.now();
  const dt = (lastFrameAt > 0) ? Math.min(0.05, (now - lastFrameAt) / 1000) : 0;
  lastFrameAt = now;

  // 依 hotbar 選取同步目前裝備（為未來切槍預留）
  syncEquippedWeaponFromHotbar(player);

  handleRoll(player);
  player.update(dt);

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