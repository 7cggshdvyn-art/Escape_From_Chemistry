const startScreen = document.getElementById("start-screen");
const mainMenu = document.getElementById("main-menu");

if (startScreen && mainMenu) {
  const enterMenu = () => {
    if (startScreen.classList.contains("fade-out")) return;

    startScreen.classList.add("fade-out");

    setTimeout(() => {
      startScreen.style.display = "none";
      mainMenu.classList.remove("is-hidden");
    }, 600);
  };

  startScreen.addEventListener("click", enterMenu);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") enterMenu();
  });
} else {
  // 如果没有开始画面，就确保主菜单可见
  if (mainMenu) mainMenu.classList.remove("is-hidden");
}
document.getElementById("btn-continue").onclick = () => console.log("继续游戏");
document.getElementById("btn-save").onclick = () => alert("这里以后做存档选择");
document.getElementById("btn-new").onclick = () => alert("这里以后做新游戏");
document.getElementById("btn-credits").onclick = () => alert("这里以后做制作人员");
document.getElementById("btn-exit").onclick = () => alert("网页版通常用返回/关闭标签页，这里先占位");

// ====== 设置 ======
const modal = document.getElementById("modal");
const openSettings = () => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};
const closeSettings = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
};

document.getElementById("btn-settings").onclick = openSettings;
document.getElementById("close").onclick = closeSettings;
modal.querySelector(".modal__backdrop").onclick = closeSettings;

// 音量显示
const vol = document.getElementById("vol");
const volv = document.getElementById("volv");
vol.addEventListener("input", () => { volv.textContent = vol.value; });

// 全屏切换
document.getElementById("fs").onclick = async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch (e) {
    alert("全屏在某些浏览器/环境可能被限制");
  }
};

// ====== 长按清档（1.2s）======
const wipeBtn = document.getElementById("btn-wipe");
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
