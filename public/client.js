let socket;
function init(isStopPage){
    socket = io();
    const last6El=document.getElementById('last6');
    const top5El=document.getElementById('top5');
    const timersEl=document.getElementById('timers');
    const lastStoppedEl=document.getElementById('lastStopped');

    function renderLast6(list){
        last6El.innerHTML=list.map(t=>`<div class="timerBox" style="background-color:${getColor(t.timer)}">${t.symbol} ${formatTime(t.duration)}</div>`).join('');
    }
    function renderTop5(list){
        top5El.innerHTML=list.map(t=>`<div>${formatTime(t.duration)} ${t.symbol}</div>`).join('');
    }
    function getColor(timer){
        switch(timer){
            case 'r':return'#FF4C4C'; case 't':return'#4C6EFF'; case 'u':return'#4CFF4C'; case 'y':return'#9B4CFF'; case 'i':return'#FF9B4C'; case 'o':return'#FFFF4C';
        }
    }
    function formatTime(ms){let s=Math.floor(ms/1000);let m=Math.floor(s/60);let sec=s%60;let milli=ms%1000;return`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}:${String(milli).padStart(3,'0')}`}

    socket.on('update',data=>{renderLast6(data.last6); renderTop5(data.top5);});
    socket.on('stopped',data=>{if(isStopPage && lastStoppedEl){lastStoppedEl.innerHTML=`<div class="timerBox" style="background-color:${getColor(data.timer)}">${data.symbol} ${formatTime(data.duration)}</div>`; setTimeout(()=>{lastStoppedEl.innerHTML=''},10000);}});

    timersEl.querySelectorAll('button').forEach(btn=>{btn.addEventListener('click',()=>{const key=btn.dataset.key; if(isStopPage){socket.emit('stop',key);}else{socket.emit('start',key);}});});
    document.addEventListener('keydown',e=>{const key=e.key.toLowerCase(); const btn=timersEl.querySelector(`[data-key="${key}"]`); if(!btn) return; if(isStopPage){socket.emit('stop',key);}else{socket.emit('start',key);}});

    if(isStopPage){
        let timer;
        timersEl.addEventListener('mousedown',e=>{if(e.shiftKey){timer=setTimeout(()=>socket.emit('reset'),5000);}});
        timersEl.addEventListener('mouseup',e=>{clearTimeout(timer);});
    }
}