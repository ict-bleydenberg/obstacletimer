function startApp(isStop){

const socket = io();

const keys = ["a","z","e","r","t","y","u","i","o","p"];

const timersDiv = document.getElementById("timers");
const lastList = document.getElementById("last");
const topList = document.getElementById("top");

let currentData = { timers:{} };
let timeOffset = 0;

/* formatter -> mm:ss:t */
function fmt(ms){
let s=Math.floor(ms/1000);
let m=Math.floor(s/60);
let tenth=Math.floor((ms%1000)/100);
return `${String(m).padStart(2,"0")}:${String(s%60).padStart(2,"0")}:${tenth}`;
}

/* kleur ophalen */
function getColor(key){
const el = document.createElement("div");
el.className = key;
document.body.appendChild(el);
const color = getComputedStyle(el).borderColor;
document.body.removeChild(el);
return color;
}

/* render */
function render(){

timersDiv.innerHTML = keys.map(k=>{
const t = currentData.timers[k];
const cls = t ? "active" : "free";
const color = getColor(k);

return `
<div class="timerBox ${k} ${cls}">
<div class="timerCircle" style="background:${color}">
  ${t ? t.number : ""}
</div>
  <div>${t ? fmt(Math.max(0, (Date.now() - timeOffset) - t.start)) : "--:--:-"}</div>
</div>
`;
}).join("");

}

/* live update */
setInterval(render, 100);

/* sync */
socket.on("sync", data=>{
currentData = data;
timeOffset = Date.now() - data.serverTime;

/* laatste 10 */
lastList.innerHTML = data.last10.map(e=>{
const color = getColor(e.key);
return `
<li>
  <div class="circleList" style="background:${color}">
    ${e.number}
  </div>
  ${fmt(e.time)}
</li>`;
}).join("");

/* top 10 */
topList.innerHTML = data.top10.map(e=>{
const color = getColor(e.key);
return `
<li>
  <div class="circleList" style="background:${color}">
    ${e.number}
  </div>
  ${fmt(e.time)}
</li>`;
}).join("");

});

/* fullscreen stop */
socket.on("stopped", e=>{
if(isStop){
const color = getColor(e.key);

const big = document.createElement("div");
big.style.position="fixed";
big.style.inset="0";
big.style.background=color;
big.style.display="flex";
big.style.justifyContent="center";
big.style.alignItems="center";
big.style.fontSize="6rem";
big.style.color="white";
big.style.zIndex="999";
big.innerHTML = `${fmt(e.time)}`;

document.body.appendChild(big);

setTimeout(()=>big.remove(), 5000);
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
}
};

/* reset */
if(isStop){
document.getElementById("reset").onclick = ()=>{
if(confirm("Reset alles?")) socket.emit("reset");
};
}

}