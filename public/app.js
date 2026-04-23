function startApp(isStop){

const socket = io();

const keys = ["a","z","e","r","t","y","u","i","o","p"];

const timersDiv = document.getElementById("timers");
const lastList = document.getElementById("last");
const topList = document.getElementById("top");

/* geluid */
const startSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
const stopSound  = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

/* fullscreen resultaat */
const big = document.createElement("div");
big.style.position = "fixed";
big.style.inset = "0";
big.style.display = "none";
big.style.justifyContent = "center";
big.style.alignItems = "center";
big.style.fontSize = "6rem";
big.style.fontWeight = "bold";
big.style.color = "white";
big.style.zIndex = "999";
document.body.appendChild(big);

let currentData = { timers:{} };

/* tijd formatter */
function fmt(ms){
let s=Math.floor(ms/1000), m=Math.floor(s/60);
return `${String(m).padStart(2,"0")}:${String(s%60).padStart(2,"0")}:${String(ms%1000).padStart(3,"0")}`;
}

/* render timers */
function render(){
timersDiv.innerHTML = keys.map(k=>{
const t = currentData.timers[k];
const cls = t ? "active" : "free";

return `
<div class="timerBox ${k} ${cls}">
  <div class="timerCircle">${t ? t.number : ""}</div>
  <div>${t ? fmt(Date.now()-t.start) : "--:--:---"}</div>
</div>
`;
}).join("");
}

/* LIVE update elke 50ms */
setInterval(render, 50);

/* sync van server */
socket.on("sync", data=>{
currentData = data;

/* laatste 10 */
lastList.innerHTML = data.last10.map(e=>
`<li>#${e.number} (${e.key}) ${fmt(e.time)}</li>`
).join("");

/* top 10 */
topList.innerHTML = data.top10.map(e=>
`<li>#${e.number} (${e.key}) ${fmt(e.time)}</li>`
).join("");
});

/* STOP event → fullscreen */
socket.on("stopped", e=>{
if(isStop){
stopSound.play();

big.style.display = "flex";
big.style.background = "black";
big.innerHTML = `#${e.number} ${fmt(e.time)}`;

setTimeout(()=>{
big.style.display = "none";
}, 5000);
}
});

/* toetsen */
document.onkeydown = e=>{
const k = e.key.toLowerCase();
if(!keys.includes(k)) return;

if(isStop){
socket.emit("stop", k);
} else {
socket.emit("start", k);
startSound.play();
}
};

/* reset */
if(isStop){
document.getElementById("reset").onclick = ()=>{
if(confirm("Reset alles?")) socket.emit("reset");
};
}

}