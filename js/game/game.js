import { player } from "./player.js";
import { initRender, renderFrame } from "./render.js";

let running = false;

export function startGame() {
  if (running) return;
  running = true;

  console.log("start game");

  // 初始化画面（canvas、贴图等）
  initRender();

  requestAnimationFrame(loop);
}

function loop() {
  player.update();

  // 每帧渲染（把玩家画出来）
  renderFrame(player);

  requestAnimationFrame(loop);
}