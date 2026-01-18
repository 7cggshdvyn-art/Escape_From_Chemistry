import { player } from "./player.js";
import { initRender, renderFrame } from "./render.js";
import rifleData from "../data/weapon/rifle/data_rifle.js";

import { isUIFocus, setUIFocus, keys } from "./input.js";
import characterData from "../data/character/data_character.js";

// R 換彈請求（由 input.js 設定）
const getReloadRequested = () => window.__reloadRequested === true;


let running = false;
let lastFrameAt = 0;

// ===== 通用動作（進度條）控制器 =====
// render.js 會讀 window.__actionBar 來畫 UI
if (!window.__actionBar) {
  window.__actionBar = { active: false, progress: 0, label: "", cancelText: "X 取消動作" };
}
let currentAction = null; // { type, startAt, endAt, label, cancelText, canContinue, onCancel, onComplete }

function startAction({
  type,
  durationMs,
  label = "",
  cancelText = "X 取消動作",
  canContinue = null,
  onCancel = null,
  onComplete = null,
}) {
  const now = performance.now();
  const dur = Math.max(1, durationMs | 0);

  currentAction = {
    type,
    startAt: now,
    endAt: now + dur,
    label,
    cancelText,
    canContinue,
    onCancel,
    onComplete,
  };

  window.__actionBar.active = true;
  window.__actionBar.progress = 0;
  window.__actionBar.label = label;
  window.__actionBar.cancelText = cancelText;
}

function endActionUI() {
  window.__actionBar.active = false;
  window.__actionBar.progress = 0;
  window.__actionBar.label = "";
  window.__actionBar.cancelText = "X 取消動作";
}

function cancelCurrentAction(reason = "") {
  if (!currentAction) return;
  const a = currentAction;
  currentAction = null;
  endActionUI();

  try {
    if (typeof a.onCancel === "function") a.onCancel(reason);
  } catch (err) {
    console.error("onCancel error", err);
  }
}

function completeCurrentAction() {
  if (!currentAction) return;
  const a = currentAction;
  currentAction = null;
  endActionUI();

  try {
    if (typeof a.onComplete === "function") a.onComplete();
  } catch (err) {
    console.error("onComplete error", err);
  }
}

function updateAction(now) {
  if (!currentAction) return;

  // 先消耗取消請求（一次性）
  if (window.__actionCancelRequested === true) {
    window.__actionCancelRequested = false;
    cancelCurrentAction("cancel");
    return;
  }

  // 若狀態不允許（例如跑步/翻滾/切槍/UI 等），直接中斷
  if (typeof currentAction.canContinue === "function") {
    if (currentAction.canContinue() !== true) {
      cancelCurrentAction("interrupt");
      return;
    }
  }

  const total = currentAction.endAt - currentAction.startAt;
  const t = (now - currentAction.startAt) / total;
  window.__actionBar.active = true;
  window.__actionBar.progress = Math.max(0, Math.min(1, t));
  window.__actionBar.label = currentAction.label;
  window.__actionBar.cancelText = currentAction.cancelText;

  if (now >= currentAction.endAt) {
    completeCurrentAction();
  }
}

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

    // ===== Recoil state (Step A: affects shot direction only) =====
    recoilPitch: 0, // 往上踢（弧度，累積）
    recoilYaw: 0,   // 左右偏（弧度，累積）
    recoilSide: (Math.random() < 0.5 ? -1 : 1), // 目前偏好方向：-1=左, +1=右
  };
}

// 在半徑 r 的圓內取均勻隨機點（避免集中在外圈）
function randomPointInCircle(r) {
  if (r <= 0) return { x: 0, y: 0 };
  const a = Math.random() * Math.PI * 2;
  const u = Math.random();
  const rr = Math.sqrt(u) * r;
  return { x: Math.cos(a) * rr, y: Math.sin(a) * rr };
}

// ===== Recoil helpers =====
// 你 data_rifle.js 的 recoil 數值偏大，先用比例換算成弧度（之後你想改成角度制也容易）
const RECOIL_TO_RAD = 0.00075; // 調整後座力手感就改這個比例

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function approach(current, target, maxDelta) {
  if (current < target) return Math.min(current + maxDelta, target);
  return Math.max(current - maxDelta, target);
}

function applyRecoilKick(w, stats, aimProgress) {
  if (!w) return { pitchKick: 0, yawKick: 0 };

  const r = stats?.recoil;
  const vRaw = (typeof r?.vertical === "number") ? r.vertical : 0;
  const hRaw = (typeof r?.horizontal === "number") ? r.horizontal : 0;

  // 開鏡越穩：kick 略小（先用很保守的比例，不影響你原本平衡太多）
  const t = clamp01(aimProgress ?? 0);
  const adsStability = 1 - 0.15 * t; // 0~1：開鏡最多減少 15%

  // 每發有一點隨機浮動，但不會亂飛
  const vJitter = 0.8 + Math.random() * 0.4; // 0.8~1.2
  const hJitter = 0.75 + Math.random() * 0.5; // 0.75~1.25

  const pitchKick = vRaw * RECOIL_TO_RAD * vJitter * adsStability;
  const yawKickBase = hRaw * RECOIL_TO_RAD * hJitter * adsStability;

  // 左右機率：以「偏好方向」為主，小機率換邊（比較像真槍蛇形）
  const swapChance = 0.18; // 想更常左右換邊就調大
  if (Math.random() < swapChance) {
    w.recoilSide *= -1;
  }

  const yawKick = yawKickBase * w.recoilSide;

  w.recoilPitch += pitchKick;
  w.recoilYaw += yawKick;

  return { pitchKick, yawKick };
}

function recoverRecoil(w, dt, aimProgress) {
  if (!w) return;

  const t = clamp01(aimProgress ?? 0);
  // 開鏡時回正稍微慢一點點（更像壓槍），你之後也可以反過來做
  const recoverPitch = (6.5 - 1.0 * t); // rad/s
  const recoverYaw = (7.5 - 1.2 * t);   // rad/s

  const dp = recoverPitch * dt;
  const dy = recoverYaw * dt;

  w.recoilPitch = approach(w.recoilPitch, 0, dp);
  w.recoilYaw = approach(w.recoilYaw, 0, dy);
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

  // 角色面向仍然跟著滑鼠（手感比較直覺）
  player.angle = baseAngle;

  // ===== Recoil (Step A): 只影響「子彈方向」 =====
  const apRecoil = window.__aimProgress ?? 0;
  const kick = applyRecoilKick(w, s, apRecoil);

  // 注意：畫面座標 y 向下為正；「往上踢」應該讓角度往上偏，所以是減去 recoilPitch
  const shotAngleFinal = shotAngle + w.recoilYaw - w.recoilPitch;

  // 讓 target 也跟著角度修正（保留原本距離，方向改成含後座力的方向）
  const dist = Math.max(1, Math.hypot(shotDx, shotDy));
  const finalTargetX = player.x + Math.cos(shotAngleFinal) * dist;
  const finalTargetY = player.y + Math.sin(shotAngleFinal) * dist;

  // 先把射擊用的角度/目標點暴露出去（之後你想讓紅線顯示實際彈道就能直接用）
  window.__lastShotAngle = shotAngleFinal;
  window.__lastShotTargetX = finalTargetX;
  window.__lastShotTargetY = finalTargetY;

  console.log("FIRE", w.def.id, "ammo", w.ammoInMag, "shotAngle", shotAngleFinal, "kick", kick);
}


function startReload(w, s, reloadSlot) {
  if (w.isReloading) return;
  w.isReloading = true;
  w.reloadSlot = reloadSlot;

  // 用通用動作系統顯示讀條（可取消、可被狀態打斷）
  startAction({
    type: "reload",
    durationMs: s.reloadTime * 1000,
    label: "換彈中",
    cancelText: "X 取消動作",
    canContinue: () => isReloadWalkOnlyState(player),
    onCancel: () => {
      cancelReload(w);
    },
    onComplete: () => {
      // 完成換彈
      w.isReloading = false;
      w.reloadSlot = undefined;
      w.ammoInMag = w.def.stats.magSize;
    },
  });
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

  // 如果目前動作就是換彈，取消時關閉通用進度條
  if (currentAction && currentAction.type === "reload") {
    currentAction = null;
    endActionUI();
  }
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

  // 目前有其他動作在跑就不開始換彈（避免讀條疊加）
  if (currentAction) return;

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

  // 保險：若狀態不允許，立刻中斷（真正的完成/取消由 action 系統處理）
  if (!isReloadWalkOnlyState(player)) {
    cancelReload(w);
  }
}

function loop() {
  const now = performance.now();
  const dt = (lastFrameAt > 0) ? Math.min(0.05, (now - lastFrameAt) / 1000) : 0;
  lastFrameAt = now;

  // 依 hotbar 選取同步目前裝備（為未來切槍預留）
  syncEquippedWeaponFromHotbar(player);

  handleRoll(player);
  updateAction(now);
  player.update(dt);

  // ===== Recoil recovery (Step A) =====
  if (player.weapon) {
    recoverRecoil(player.weapon, dt, window.__aimProgress ?? 0);
  }

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