import { keys } from "./input.js";

export const player = {
  x: 100,
  y: 100,
  angle: 0, // 初始朝向：向右（0 弧度）

  // ===== 基础移动参数（单位：m/s 或 m） =====
  walkSpeed: 4.0,
  runSpeed: 7.8,
  rollDistance: 3.0,
  rollDuration: 0.8, // 秒

  // ===== 翻滚状态 =====
  isRolling: false,
  rollTimeLeft: 0,
  rollDirX: 0,
  rollDirY: 0,

  update(dt) {
    if (dt <= 0) return;

    // ===== 翻滚中 =====
    if (this.isRolling) {
      // 翻滚距离以「米」定义，这里转换成像素（与移动速度一致，1m = 50px）
      const speed = (this.rollDistance * 50) / this.rollDuration; // px/s
      this.x += this.rollDirX * speed * dt;
      this.y += this.rollDirY * speed * dt;

      this.rollTimeLeft -= dt;
      if (this.rollTimeLeft <= 0) {
        this.isRolling = false;
      }
      return;
    }

    // ===== 普通移动 =====
    let dx = 0;
    let dy = 0;

    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    // 没有输入就不移动
    if (dx === 0 && dy === 0) return;

    // 方向归一化（避免斜向更快）
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;

    // 跑步 or 走路
    const isRunning = keys.shift === true;
    let speed = (isRunning ? this.runSpeed : this.walkSpeed) * 50; // px/s

    // ===== 武器移动系数 =====
    if (this.weapon && this.weapon.def && this.weapon.def.stats) {
      const stats = this.weapon.def.stats;
      // 已完成开镜 → 使用 aimSpeedCoef
      if (window.__aimProgress >= 0.85 && typeof stats.aimSpeedCoef === "number") {
        speed *= stats.aimSpeedCoef;
      }
      // 腰射 / 未开镜 → 使用 moveSpeedCoef
      else if (typeof stats.moveSpeedCoef === "number") {
        speed *= stats.moveSpeedCoef;
      }
    }

    this.x += dx * speed * dt;
    this.y += dy * speed * dt;
  },

  // ===== 触发翻滚（由 game.js 或 input.js 调用） =====
  startRoll(dirX, dirY) {
    if (this.isRolling) return;

    // 没方向就用当前朝向
    if (dirX === 0 && dirY === 0) {
      dirX = Math.cos(this.angle);
      dirY = Math.sin(this.angle);
    }

    const len = Math.hypot(dirX, dirY) || 1;
    this.rollDirX = dirX / len;
    this.rollDirY = dirY / len;

    this.isRolling = true;
    this.rollTimeLeft = this.rollDuration;
  },
};