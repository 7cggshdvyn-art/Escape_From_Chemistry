import { startGame } from "./game/game.js";
console.log("main module loaded");
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // ====== 开始画面：点击淡出 -> 显示主菜单 ======
  const startScreen = $("start-screen");
  const mainMenu = $("main-menu");

  const showMainMenu = () => {
    if (mainMenu) mainMenu.classList.remove("is-hidden");
  };

  if (startScreen) {
    const enterMenu = () => {
      // 防止重复触发
      if (startScreen.classList.contains("fade-out")) return;

      startScreen.classList.add("fade-out");

      setTimeout(() => {
        startScreen.style.display = "none";
        showMainMenu();
      }, 600);
    };

    startScreen.addEventListener("click", enterMenu);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") enterMenu();
    });
  } else {
    // 如果没有开始画面，就确保主菜单可见
    showMainMenu();
  }

  // ====== 按钮（占位逻辑，之后你再接真实功能）======
  const btnContinue = $("btn-continue");
  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      console.log("进入游戏");
      startGame();
    });
  }

  const btnSave = $("btn-save");
  if (btnSave) btnSave.addEventListener("click", () => alert("这里以后做存档选择"));

  const btnNew = $("btn-new");
  if (btnNew) btnNew.addEventListener("click", () => alert("这里以后做新游戏"));

  const btnCredits = $("btn-credits");
  if (btnCredits) btnCredits.addEventListener("click", () => alert("Karson, Aaaron, Nathan, 其他我還不確定"));

  const btnExit = $("btn-exit");
  if (btnExit) btnExit.addEventListener("click", () => alert("网页版通常用返回/关闭标签页，这里先占位"));

  // ====== 设置（真的可用）======
  const modal = $("modal");
  const closeBtn = $("close");
  const btnSettings = $("btn-settings");
  const vol = $("vol");
  const volv = $("volv");
  const fsBtn = $("fs");

  const openSettings = () => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeSettings = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  if (btnSettings) btnSettings.addEventListener("click", openSettings);
  if (closeBtn) closeBtn.addEventListener("click", closeSettings);

  if (modal) {
    const backdrop = modal.querySelector(".modal__backdrop");
    if (backdrop) backdrop.addEventListener("click", closeSettings);
  }

  if (vol && volv) {
    vol.addEventListener("input", () => { volv.textContent = vol.value; });
  }

  if (fsBtn) {
    fsBtn.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch (e) {
        alert("全屏在某些浏览器/环境可能被限制");
      }
    });
  }

  // ====== 长按清档（1.2s）======
  const wipeBtn = $("btn-wipe");
  if (wipeBtn) {
    let holdTimer = null;
    let holding = false;

    const startHold = () => {
      if (holding) return;
      holding = true;
      wipeBtn.classList.add("is-holding");

      holdTimer = setTimeout(() => {
        wipeBtn.classList.remove("is-holding");
        holding = false;
        localStorage.clear();
        alert("存档数据已清除");
      }, 1200);
    };

    const endHold = () => {
      if (!holding) return;
      holding = false;
      wipeBtn.classList.remove("is-holding");
      clearTimeout(holdTimer);
      holdTimer = null;
    };

    wipeBtn.addEventListener("mousedown", startHold);
    wipeBtn.addEventListener("mouseup", endHold);
    wipeBtn.addEventListener("mouseleave", endHold);

    // 触屏
    wipeBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startHold();
    }, { passive: false });

    wipeBtn.addEventListener("touchend", endHold);
    wipeBtn.addEventListener("touchcancel", endHold);
  }
});
