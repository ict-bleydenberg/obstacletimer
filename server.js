const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const timers = { r: null, t: null, u: null, y: null, i: null, o: null };
let last6 = [];
let top5 = [];

function addTime(timer, duration) {
    last6.unshift({timer, duration, symbol: getSymbol(timer)});
    if (last6.length > 6) last6.pop();
    top5.push({timer, duration, symbol: getSymbol(timer)});
    top5.sort((a,b)=>a.duration - b.duration);
    if (top5.length>5) top5.pop();
}

function getSymbol(timer){
    switch(timer){
        case 'r': return '🍌';
        case 't': return '👟';
        case 'u': return '🪣';
        case 'y': return '🚲';
        case 'i': return '🏁';
        case 'o': return '🍎';
    }
}

io.on('connection', (socket) => {
    socket.emit('update', {timers, last6, top5});
    socket.on('start', (key) => { if(!timers[key]) timers[key]=Date.now(); io.emit('update',{timers,last6,top5}); });
    socket.on('stop', (key) => { if(timers[key]) { const duration=Date.now()-timers[key]; timers[key]=null; addTime(key,duration); io.emit('stopped',{timer:key,duration}); io.emit('update',{timers,last6,top5}); } });
    socket.on('reset', ()=>{ top5=[]; io.emit('update',{timers,last6,top5}); });
});

http.listen(process.env.PORT||3000, ()=>console.log('Server running'));