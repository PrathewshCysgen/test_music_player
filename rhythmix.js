// ---------- CONFIG ----------
const API_KEY = "AIzaSyB5YbUIdDQGsuvb5GrQtR3hqM55AJWiAsk";
const MAX_RESULTS = 8;

// ---------- STATE ----------
let queue = [];
let library = JSON.parse(localStorage.getItem("library") || "[]");
let exploreSongs = [];
let history = JSON.parse(localStorage.getItem("history") || "[]"); // NEW
let currentIndex = 0;
let isPlaying = false;
let ytPlayer = null;
let ytReady = false;

// ---------- DOM ----------
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const searchBox = document.getElementById("searchBox");

const playerCover = document.getElementById("playerCover");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const vol = document.getElementById("vol");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const currentTimeEl = document.getElementById("currentTime");
const durationTimeEl = document.getElementById("durationTime");

// ---------- TABS ----------
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    tabContents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab).classList.add("active");

    // Render placeholder/history if home tab
    if(tab === "home" && document.getElementById("home").children.length === 0){
      renderHomePlaceholder();
    }
  });
});

// ---------- HOME PLACEHOLDER + HISTORY ----------
function renderHomePlaceholder() {
  const homeEl = document.getElementById("home");
  homeEl.innerHTML = `
    <div class="home-placeholder">
      <h3>Welcome to Rhythmix 🎵</h3>
      <p>Start searching for your favorite songs above!</p>
    </div>
  `;

  if(history.length > 0){
    const recentEl = document.createElement("div");
    recentEl.className = "recent-history";
    recentEl.innerHTML = `<h4>Recently Played</h4>`;

    const grid = document.createElement("div");
    grid.className = "history-grid";

  history.slice().reverse().forEach(song => {
    const card = document.createElement("div");
    card.className = "history-card";

    // Truncate title to max 40 characters
    let displayTitle = song.title;
    if(displayTitle.length > 40) displayTitle = displayTitle.slice(0, 37) + "...";

    card.innerHTML = `
      <img src="${song.thumb}">
      <div class="title">${displayTitle}</div>
    `;

    card.onclick = () => addToQueue(song);
    grid.appendChild(card);
  });

    recentEl.appendChild(grid);
    homeEl.appendChild(recentEl);
  }
}

// ---------- YOUTUBE IFRAME ----------
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("ytPlayerContainer", {
    height: "0", width: "0",
    events: {
      onReady: () => { ytReady = true; updatePlayerUI(); },
      onStateChange: onYTStateChange,
      onError: (err) => {
        console.warn("Video unplayable, skipping...", err);
        // Skip to next video
        if(queue.length > 1){
          currentIndex = (currentIndex + 1) % queue.length;
          play();
        } else {
          pause();
        }
      }
    },
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 }
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onYTStateChange(e){
  if(e.data === YT.PlayerState.PLAYING){ isPlaying = true; playIcon.className="bi bi-pause-fill"; }
  else if(e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED){ isPlaying = false; playIcon.className="bi bi-play-fill"; }
  if(e.data === YT.PlayerState.ENDED) next();
}

// ---------- PLAYBACK ----------
function play(index){
  if(index !== undefined) currentIndex = index;
  if(queue.length === 0) return;

  const song = queue[currentIndex];
  if(!song || !ytReady) return;

  // Attach temporary onError handler
  ytPlayer.loadVideoById({
    videoId: song.id,
    suggestedQuality: "small"
  });

  ytPlayer.setVolume(Math.round(vol.value*100));
  ytPlayer.playVideo();
  isPlaying = true;
  updatePlayerUI();
  saveQueue();
}

// Catch errors from unplayable videos
function onYTStateChange(e){
  if(e.data === YT.PlayerState.PLAYING){
    isPlaying = true; 
    playIcon.className="bi bi-pause-fill";
  } else if(e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED){
    isPlaying = false; 
    playIcon.className="bi bi-play-fill";
  }
  if(e.data === YT.PlayerState.ENDED) next();
}

function pause(){ if(ytReady) ytPlayer.pauseVideo(); isPlaying=false; }

function next(){ if(queue.length===0) return; currentIndex=(currentIndex+1)%queue.length; play(); }
function prev(){ if(getCurrentTime()>3) setCurrentTime(0); else{ currentIndex=(currentIndex-1+queue.length)%queue.length; play(); } }

function getCurrentTime(){ return ytReady ? ytPlayer.getCurrentTime() : 0; }
function getDuration(){ return ytReady ? ytPlayer.getDuration() : 0; }
function setCurrentTime(t){ if(ytReady) ytPlayer.seekTo(t,true); }

function formatTime(s){ if(!s||isNaN(s)) return "0:00"; s=Math.floor(s); const m=Math.floor(s/60); const sec=s%60; return `${m}:${sec<10?"0"+sec:sec}`; }

function updatePlayerUI(){
  const song = queue[currentIndex];
  if(!song) return;
  playerCover.src = song.thumb;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.channel;
  renderQueue();
}

// ---------- QUEUE ----------
function addToQueue(song){
  queue.push(song);
  currentIndex=queue.length-1;
  saveQueue();
  play();
}

function renderQueue(){
  const qEl = document.getElementById("queue");
  qEl.innerHTML="";
  queue.forEach((song,i)=>{
    const div=document.createElement("div");
    div.className="tab-item";
    div.innerHTML=`
      <img src="${song.thumb}">
      <div class="info">
        <div class="title">${song.title}</div>
        <div class="channel">${song.channel}</div>
      </div>
      <i class="bi bi-heart like-btn ${library.find(s=>s.id===song.id)?'liked':''}"></i>
      <i class="bi bi-x remove-btn" title="Remove from Queue"></i>
    `;

    div.querySelector(".info").onclick = ()=>play(i);
    const heart = div.querySelector(".like-btn");
    heart.onclick = e=>{ e.stopPropagation(); toggleLibrary(song, heart); }

    const removeBtn = div.querySelector(".remove-btn");
    removeBtn.onclick = e=>{
      e.stopPropagation();
      queue.splice(i,1);
      if(currentIndex >= i) currentIndex = Math.max(0, currentIndex-1);
      renderQueue();
      saveQueue();
      updatePlayerUI();
    }

    qEl.appendChild(div);
  });
}

// ---------- LIBRARY ----------
function toggleLibrary(song, icon){
  const idx = library.findIndex(s=>s.id===song.id);
  if(idx>=0){ library.splice(idx,1); icon.classList.remove("liked"); }
  else{ library.push(song); icon.classList.add("liked"); }
  localStorage.setItem("library",JSON.stringify(library));
  renderLibrary();
}

function renderLibrary(){
  const libEl=document.getElementById("library");
  libEl.innerHTML="";
  library.forEach(song=>{
    const div=document.createElement("div");
    div.className="tab-item";
    div.innerHTML=`
      <img src="${song.thumb}">
      <div class="info">
        <div class="title">${song.title}</div>
        <div class="channel">${song.channel}</div>
      </div>
    `;
    div.onclick = ()=>addToQueue(song);
    libEl.appendChild(div);
  });
}

// ---------- SEARCH ----------
searchBox.addEventListener("keydown", e => {
  if (e.key === "Enter" && searchBox.value.trim()) 
    searchYouTube(searchBox.value.trim() + " official audio");
});


async function searchYouTube(query){
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoDuration=medium&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&key=${API_KEY}`;

  try{
    const res=await fetch(url);
    const data=await res.json();
    const items=data.items.map(i=>({
      id:i.id.videoId,
      title:i.snippet.title,
      channel:i.snippet.channelTitle,
      thumb:i.snippet.thumbnails.medium.url
    }));
    renderSearchResults(items);
  }catch(e){ console.error("Search error", e); }
}

function renderSearchResults(items){
  const homeEl = document.getElementById("home");
  homeEl.innerHTML = "";
  items.forEach(song => {
    const div = document.createElement("div");
    div.className = "tab-item";
    div.innerHTML = `
      <img src="${song.thumb}">
      <div class="info">
        <div class="title">${song.title}</div>
        <div class="channel">${song.channel}</div>
      </div>
      <i class="bi bi-heart like-btn ${library.find(s=>s.id===song.id)?'liked':''}"></i>
    `;
    div.querySelector(".info").onclick = ()=>addToQueue(song);
    const heart = div.querySelector(".like-btn");
    heart.onclick = e => { e.stopPropagation(); toggleLibrary(song, heart); }
    homeEl.appendChild(div);
  });
}

// ---------- EXPLORE ----------
async function loadExplore(){
  const url=`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=${MAX_RESULTS}&regionCode=US&key=${API_KEY}`;
  try{
    const res=await fetch(url);
    const data=await res.json();
    const items=data.items.map(i=>({
      id:i.id,
      title:i.snippet.title,
      channel:i.snippet.channelTitle,
      thumb:i.snippet.thumbnails.medium.url
    }));
    exploreSongs = items;
    renderExplore();
  }catch(e){ console.error("Explore load error", e); }
}

function renderExplore(){
  const exEl=document.getElementById("explore");
  exEl.innerHTML="";
  exploreSongs.forEach(song=>{
    const div=document.createElement("div");
    div.className="tab-item";
    div.innerHTML=`
      <img src="${song.thumb}">
      <div class="info">
        <div class="title">${song.title}</div>
        <div class="channel">${song.channel}</div>
      </div>
      <i class="bi bi-heart like-btn ${library.find(s=>s.id===song.id)?'liked':''}"></i>
    `;
    div.querySelector(".info").onclick = ()=>addToQueue(song);
    const heart = div.querySelector(".like-btn");
    heart.onclick=(e)=>{ e.stopPropagation(); toggleLibrary(song, heart); }
    exEl.appendChild(div);
  });
}

// ---------- LOCAL STORAGE QUEUE ----------
function saveQueue(){ localStorage.setItem("queue",JSON.stringify({queue,currentIndex})); }
function loadQueue(){ 
  const saved = localStorage.getItem("queue"); 
  if(saved){ 
    const data = JSON.parse(saved); 
    queue=data.queue||[]; currentIndex=data.currentIndex||0;
  }
}

loadQueue();
loadExplore();
renderLibrary();
renderQueue();
updatePlayerUI();
renderHomePlaceholder(); // Show placeholder/history on load

// Make Home tab active by default
tabs.forEach(b => b.classList.remove("active"));
document.querySelector('.tab-btn[data-tab="home"]').classList.add("active");
tabContents.forEach(c => c.classList.remove("active"));
document.getElementById("home").classList.add("active");

// ---------- PLAYER EVENTS ----------
playBtn.onclick = ()=>isPlaying ? pause() : play();
nextBtn.onclick=next;
prevBtn.onclick=prev;
vol.oninput=()=>{ if(ytReady) ytPlayer.setVolume(Math.round(vol.value*100)); }

setInterval(()=>{
  const dur=getDuration();
  const cur=getCurrentTime();
  if(dur>0){ 
    progressFill.style.width=(cur/dur*100)+"%"; 
    currentTimeEl.textContent=formatTime(cur); 
    durationTimeEl.textContent=formatTime(dur); 
  }
},500);
