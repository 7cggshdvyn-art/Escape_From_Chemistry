import { keys } from "./input.js";

export const player = {
  x: 100,
  y: 100,
  speed: 3,
  update() {
    if (keys.up) this.y -= this.speed;
    if (keys.down) this.y += this.speed;
    if (keys.left) this.x -= this.speed;
    if (keys.right) this.x += this.speed;
  },
};