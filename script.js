/* ==========
  Light "protection" (cannot fully block devtools, but discourages)
========== */
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("dragstart", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());

/* ==========
  Gate -> Space
========== */
const gate = document.getElementById("gate");
const space = document.getElementById("space");
const enterBtn = document.getElementById("enterBtn");

enterBtn?.addEventListener("click", () => {
  document.body.classList.add("is-entered");
  gate?.classList.add("is-hidden");
  space?.classList.remove("is-hidden");
  tryStartMusic();
});

/* ==========
  Cute sparkle burst
========== */
const burstBtn = document.getElementById("burstBtn");
const stage = document.getElementById("stage");

const rnd = (a,b)=> a + Math.random()*(b-a);
function burst(){
  if (!stage) return;
  for(let i=0;i<18;i++){
    const s = document.createElement("span");
    s.textContent = ["♡","✿","★"][Math.floor(Math.random()*3)];
    s.style.position="absolute";
    s.style.left = (stage.clientWidth/2 + rnd(-120,120))+"px";
    s.style.top  = (stage.clientHeight/2 + rnd(-60,120))+"px";
    s.style.fontFamily = "Cherry Bomb One, cursive";
    s.style.fontSize = rnd(18,30)+"px";
    s.style.color = "rgba(255,255,255,.95)";
    s.style.textShadow = "0 16px 32px rgba(0,0,0,.25)";
    s.style.pointerEvents="none";
    s.style.zIndex="6";
    stage.appendChild(s);

    const dx = rnd(-160,160);
    const dy = rnd(-220,-60);
    s.animate(
      [
        { transform:"translate(0,0) scale(1)", opacity:1 },
        { transform:`translate(${dx}px, ${dy}px) scale(1.25)`, opacity:0 }
      ],
      { duration: 900, easing: "cubic-bezier(.2,.9,.2,1)" }
    ).onfinish = ()=> s.remove();
  }
}
burstBtn?.addEventListener("click", burst);

/* ==========
  Gallery open/close + zoom
========== */
const photosBtn = document.getElementById("photosBtn");
const gallery = document.getElementById("gallery");
const closeGallery = document.getElementById("closeGallery");
const backToProfile = document.getElementById("backToProfile");

const zoomModal = document.getElementById("zoomModal");
const zoomImg = document.getElementById("zoomImg");
const zoomBackdrop = document.getElementById("zoomBackdrop");
const zoomClose = document.getElementById("zoomClose");

function showGallery(){ gallery?.classList.remove("is-hidden"); }
function hideGallery(){ gallery?.classList.add("is-hidden"); }

photosBtn?.addEventListener("click", (e) => { e.preventDefault(); showGallery(); });
closeGallery?.addEventListener("click", hideGallery);
backToProfile?.addEventListener("click", hideGallery);

document.querySelectorAll(".zoomBtn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const fig = e.currentTarget.closest(".polaroid");
    const img = fig?.querySelector("img");
    if (!img) return;

    zoomImg.src = img.src;
    zoomModal?.classList.remove("is-hidden");
  });
});

function closeZoom(){
  zoomModal?.classList.add("is-hidden");
  zoomImg.src = "";
}
zoomBackdrop?.addEventListener("click", closeZoom);
zoomClose?.addEventListener("click", closeZoom);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape"){
    if (zoomModal && !zoomModal.classList.contains("is-hidden")) closeZoom();
    else if (gallery && !gallery.classList.contains("is-hidden")) hideGallery();
  }
});

/* ==========
  Polaroid micro-tilt (mouse)
========== */
document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -6;
    const ry = (px - 0.5) *  6;
    card.style.transform = `rotate(0deg) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

/* ==========
  YouTube Player (VISIBLE) + custom controls
========== */
let ytPlayer = null;
let ytReady = false;
let isMuted = false;

const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const vol = document.getElementById("vol");

const toggleVideo = document.getElementById("toggleVideo");
const videoWrap = document.getElementById("videoWrap");

toggleVideo?.addEventListener("click", () => {
  if (!videoWrap) return;
  const hidden = videoWrap.style.display === "none";
  videoWrap.style.display = hidden ? "" : "none";
  toggleVideo.textContent = hidden ? "▾" : "▸";
});

function setPlayIcon(){
  if (!ytReady || !ytPlayer || !playBtn) return;
  const st = ytPlayer.getPlayerState();
  playBtn.textContent = (st === 1) ? "⏸" : "▶";
}
function setMuteIcon(){
  if (!muteBtn) return;
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
}

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("yt", {
    width: "320",
    height: "180",
    videoId: "oDVLnouh-mA", // ✅ FIXED MUSIC ID
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(parseInt(vol?.value ?? "65", 10));
        ytPlayer.unMute();
        isMuted = false;
        setMuteIcon();
        setPlayIcon();
      },
      onStateChange: () => setPlayIcon()
    }
  });
};

function tryStartMusic(){
  if (!ytReady || !ytPlayer) return;
  ytPlayer.unMute();
  isMuted = false;
  setMuteIcon();
  ytPlayer.setVolume(parseInt(vol?.value ?? "65", 10));
  ytPlayer.playVideo();
  setPlayIcon();
}

playBtn?.addEventListener("click", () => {
  if (!ytReady || !ytPlayer) return;
  const st = ytPlayer.getPlayerState();
  if (st === 1) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
  setPlayIcon();
});

muteBtn?.addEventListener("click", () => {
  if (!ytReady || !ytPlayer) return;
  if (isMuted){ ytPlayer.unMute(); isMuted = false; }
  else { ytPlayer.mute(); isMuted = true; }
  setMuteIcon();
});

vol?.addEventListener("input", () => {
  if (!ytReady || !ytPlayer || !vol) return;
  ytPlayer.setVolume(parseInt(vol.value, 10));
});
