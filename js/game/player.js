import { keys } from "./input.js";

export const player = {
  x: 100,
  y: 100,
  speed: 3,
  update() {
    if (keys.ArrowUp) this.y -= this.speed;
    if (keys.ArrowDown) this.y += this.speed;
    if (keys.ArrowLeft) this.x -= this.speed;
    if (keys.ArrowRight) this.x += this.speed;
  },
};