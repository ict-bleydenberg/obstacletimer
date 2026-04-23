const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Timer data structure
const timers = {};
const allTimes = [];

// Initialize timers
const TIMERS_CONFIG = [
    { key: 'a', emoji: '🍌' },
    { key: 'z', emoji: '👟' },
    { key: 'e', emoji: '🦄' },
    { key: 'r', emoji: '🚀' },
    { key: 't', emoji: '🌟' },
    { key: 'y', emoji: '🦋' },
    { key: 'u', emoji: '🌈' },
    { key: 'i', emoji: '🎈' },
    { key: 'o', emoji: '🍎' },
    { key: 'p', emoji: '🎯' }
];

TIMERS_CONFIG.forEach(t => {
    timers[t.key] = {
        startTime: null,
        running: false
    };
});

function getTop10() {
    return [...allTimes]
        .sort((a, b) => a.duration - b.duration)
        .slice(0, 10);
}

function getLast10() {
    return [...allTimes]
        .reverse()
        .slice(0, 10);
}

function broadcastUpdate() {
    io.emit('update', {
        top10: getTop10(),
        last10: getLast10()
    });
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to new client
    socket.emit('update', {
        top10: getTop10(),
        last10: getLast10()
    });
    
    // Send running timers state
    TIMERS_CONFIG.forEach(t => {
        if (timers[t.key].running) {
            socket.emit('timerStarted', {
                key: t.key,
                startTime: timers[t.key].startTime
            });
        }
    });

    // Handle timer start
    socket.on('start', (key) => {
        if (!timers[key] || timers[key].running) return;
        
        timers[key].startTime = Date.now();
        timers[key].running = true;
        
        io.emit('timerStarted', {
            key: key,
            startTime: timers[key].startTime
        });
        
        console.log(`Timer ${key} started at ${timers[key].startTime}`);
    });

    // Handle timer stop
    socket.on('stop', (key) => {
        if (!timers[key] || !timers[key].running) return;
        
        const duration = Date.now() - timers[key].startTime;
        const timerConfig = TIMERS_CONFIG.find(t => t.key === key);
        
        // Store the time
        allTimes.push({
            timer: key,
            symbol: timerConfig ? timerConfig.emoji : key,
            duration: duration,
            timestamp: Date.now()
        });
        
        // Reset timer
        timers[key].startTime = null;
        timers[key].running = false;
        
        // Broadcast updates
        io.emit('timerStopped', { key: key });
        broadcastUpdate();
        
        console.log(`Timer ${key} stopped. Duration: ${duration}ms`);
    });

    // Handle reset (long press on stop page)
    socket.on('reset', () => {
        TIMERS_CONFIG.forEach(t => {
            timers[t.key].startTime = null;
            timers[t.key].running = false;
            io.emit('timerStopped', { key: t.key });
        });
        allTimes.length = 0;
        broadcastUpdate();
        console.log('All timers and times reset');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Obstacle Run Timer server running on http://localhost:${PORT}`);
    console.log('Start page: http://localhost:' + PORT + '/index.php');
    console.log('Stop page: http://localhost:' + PORT + '/stop.php');
});
