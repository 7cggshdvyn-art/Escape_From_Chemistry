// js/game/enemy.js
// 最小可用敵人邏輯：HP、死亡、受傷。
// 規則：只有打到頭才套用武器的 critMultiplier；其他部位一律正常傷害。

export class Enemy {
  constructor({ id = "enemy", x = 0, y = 0, maxHp = 100 } = {}) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.maxHp = maxHp;
    this.hp = maxHp;
    this.alive = true;

    // 之後可以接動畫/AI 狀態
    this.state = "idle";
  }

  /**
   * 直接扣血（外部已算好最終傷害用這個）
   */
  takeDamage(amount) {
    if (!this.alive) return;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return;

    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.onDeath();
    } else {
      this.onHurt(dmg);
    }
  }

  /**
   * 命中入口：只處理「爆頭才爆擊」的規則。
   * @param {number} baseDamage - 武器基礎傷害（stats.damage）
   * @param {object} hit - 命中資訊（至少要有 part）
   * @param {string} hit.part - "head" | "body" | "limb" | ...
   * @param {number} critMultiplier - 武器爆擊倍率（stats.critMultiplier），只在 head 時使用
   * @returns {number} finalDamage - 實際扣血量
   */
  takeHit(baseDamage, hit = {}, critMultiplier = 1) {
    const base = Math.max(0, Number(baseDamage) || 0);
    if (base <= 0) return 0;

    const part = String(hit.part || "body").toLowerCase();
    const isHead = part === "head";
    const mul = isHead ? (Number(critMultiplier) || 1) : 1;

    const finalDamage = base * mul;
    this.takeDamage(finalDamage);
    return finalDamage;
  }

  onHurt(/* dmg */) {
    // 之後可加：受傷音效、受擊反應、仇恨
  }

  onDeath() {
    // 之後可加：掉落、死亡動畫、移除
    this.state = "dead";
  }

  // 方便 debug
  getHpRatio() {
    return this.maxHp > 0 ? this.hp / this.maxHp : 0;
  }
}

export function createEnemy(opts) {
  return new Enemy(opts);
}

export default Enemy;