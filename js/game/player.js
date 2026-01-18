import { keys } from "./input.js";

export const player = {
  x: 100,
  y: 100,
  angle: 0, // 初始朝向：向右（0 弧度）

  // ===== 像素比例尺 =====
  PPM: 50, // 1 meter = 20 pixels

  // ===== 基础移动参数（单位：m/s 或 m） =====
  walkSpeed: 4.0,
  runSpeed: 7.8,
  rollDistance: 3.0,
  rollDuration: 0.5, // 秒

  // ===== 翻滚状态 =====
  isRolling: false,
  rollTimeLeft: 0,
  rollDirX: 0,
  rollDirY: 0,

  update(dt) {
    if (dt <= 0) return;

    // ===== 翻滚中 =====
    if (this.isRolling) {
      const speed = (this.rollDistance / this.rollDuration) * this.PPM; // px/s
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
    const speed = (isRunning ? this.runSpeed : this.walkSpeed) * this.PPM; // px/s

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