// js/game/damage.js
// 統一傷害計算入口（Step 1）：
// - 只有爆頭（hitPart === "head"）才套用 critMultiplier
// - 其他部位一律正常傷害
// - 本檔案只負責算「最後扣多少血」並套用到 enemy

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function calcDamage({
  weaponStats,
  hitPart,
  // 先保留，之後再接：
  enemy = null,
  difficultyMultiplier = 1,
  elementBonusSum = 0,
} = {}) {
  const base = Math.max(0, num(weaponStats?.damage, 0));
  if (base <= 0) return 0;

  const part = String(hitPart || "body").toLowerCase();
  const isHead = part === "head";

  const critMul = isHead ? Math.max(0, num(weaponStats?.critMultiplier, 1)) : 1;

  // Step 1：先不算護甲/穿透；先把欄位留著，方便之後擴充。
  const armorMit = 1;

  const elemMul = 1 + num(elementBonusSum, 0);
  const diffMul = num(difficultyMultiplier, 1);

  const dmg = base * critMul * armorMit * elemMul * diffMul;
  return Math.max(0, dmg);
}

/**
 * 套用傷害到敵人
 * @returns {number} appliedDamage
 */
export function applyDamage({
  enemy,
  weaponStats,
  hitPart,
  difficultyMultiplier = 1,
  elementBonusSum = 0,
} = {}) {
  if (!enemy || enemy.alive === false) return 0;

  const dmg = calcDamage({
    weaponStats,
    hitPart,
    enemy,
    difficultyMultiplier,
    elementBonusSum,
  });

  if (dmg > 0 && typeof enemy.takeDamage === "function") {
    enemy.takeDamage(dmg);
  }

  return dmg;
}

export default {
  calcDamage,
  applyDamage,
};
