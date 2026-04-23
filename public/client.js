const TIMERS_CONFIG = [
    { key: 'a', emoji: '🍌', name: 'Banaan', color: '#FF6B6B' },
    { key: 'z', emoji: '👟', name: 'Schoen', color: '#4ECDC4' },
    { key: 'e', emoji: '🦄', name: 'Eenhoorn', color: '#9B59B6' },
    { key: 'r', emoji: '🚀', name: 'Raket', color: '#E74C3C' },
    { key: 't', emoji: '🌟', name: 'Ster', color: '#F39C12' },
    { key: 'y', emoji: '🦋', name: 'Vlinder', color: '#3498DB' },
    { key: 'u', emoji: '🌈', name: 'Regenboog', color: '#2ECC71' },
    { key: 'i', emoji: '🎈', name: 'Ballon', color: '#E91E63' },
    { key: 'o', emoji: '🍎', name: 'Appel', color: '#FF5722' },
    { key: 'p', emoji: '🎯', name: 'Doelwit', color: '#00BCD4' }
];

let socket;
const timers = {};
let updateInterval;

function init(isStopPage) {
    socket = io();
    const timersGrid = document.getElementById('timers');
    const last10El = document.getElementById('last10');
    const top10El = document.getElementById('top10');

    // Initialize timers state
    TIMERS_CONFIG.forEach(config => {
        timers[config.key] = {
            ...config,
            startTime: null,
            running: false
        };
    });

    // Render timer cards
    renderTimerCards(timersGrid);

    // Update times display
    updateInterval = setInterval(() => {
        updateRunningTimers();
    }, 50);

    // Socket events
    socket.on('update', data => {
        renderLast10(data.last10 || []);
        renderTop10(data.top10 || []);
    });

    socket.on('timerStarted', data => {
        if (timers[data.key]) {
            timers[data.key].startTime = data.startTime;
            timers[data.key].running = true;
            updateTimerCard(data.key);
        }
    });

    socket.on('timerStopped', data => {
        if (timers[data.key]) {
            timers[data.key].startTime = null;
            timers[data.key].running = false;
            updateTimerCard(data.key);
        }
    });

    // Keyboard events
    document.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        const config = TIMERS_CONFIG.find(t => t.key === key);
        if (!config) return;
        
        if (isStopPage) {
            socket.emit('stop', key);
        } else {
            socket.emit('start', key);
        }
    });

    // Button click events
    timersGrid.querySelectorAll('.timer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            if (isStopPage) {
                socket.emit('stop', key);
            } else {
                socket.emit('start', key);
            }
        });
    });
}

function renderTimerCards(container) {
    container.innerHTML = TIMERS_CONFIG.map(timer => `
        <div class="timer-card idle" id="card-${timer.key}" style="--timer-color: ${timer.color}">
            <span class="key-hint">[${timer.key.toUpperCase()}]</span>
            <button class="timer-btn" data-key="${timer.key}" style="background: ${timer.color}">
                ${timer.emoji}
            </button>
            <div class="timer-time" id="time-${timer.key}">00:00:000</div>
            <div class="timer-label">${timer.name}</div>
        </div>
    `).join('');
}

function updateTimerCard(key) {
    const card = document.getElementById(`card-${key}`);
    const timeEl = document.getElementById(`time-${key}`);
    const timer = timers[key];
    
    if (timer.running) {
        card.classList.remove('idle');
        card.classList.add('running');
    } else {
        card.classList.remove('running');
        card.classList.add('idle');
        timeEl.textContent = '00:00:000';
    }
}

function updateRunningTimers() {
    TIMERS_CONFIG.forEach(timer => {
        if (timer.running && timer.startTime) {
            const elapsed = Date.now() - timer.startTime;
            const timeEl = document.getElementById(`time-${timer.key}`);
            if (timeEl) {
                timeEl.textContent = formatTime(elapsed);
            }
        }
    });
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const milli = ms % 1000;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(milli).padStart(3, '0')}`;
}

function renderLast10(list) {
    const last10El = document.getElementById('last10');
    if (!list || list.length === 0) {
        last10El.innerHTML = '<div class="time-item" style="justify-content: center; color: #888;">Nog geen tijden</div>';
        return;
    }
    
    last10El.innerHTML = list.slice(0, 10).map((item, index) => {
        const config = TIMERS_CONFIG.find(t => t.key === item.timer) || TIMERS_CONFIG[0];
        return `
            <div class="time-item" style="--timer-color: ${config.color}">
                <span class="emoji">${config.emoji}</span>
                <span class="key-badge" style="background: ${config.color}">${item.timer.toUpperCase()}</span>
                <span class="time-value">${formatTime(item.duration)}</span>
            </div>
        `;
    }).join('');
}

function renderTop10(list) {
    const top10El = document.getElementById('top10');
    if (!list || list.length === 0) {
        top10El.innerHTML = '<div class="time-item" style="justify-content: center; color: #888;">Nog geen tijden</div>';
        return;
    }
    
    const medals = ['🥇', '🥈', '🥉'];
    top10El.innerHTML = list.slice(0, 10).map((item, index) => {
        const config = TIMERS_CONFIG.find(t => t.key === item.timer) || TIMERS_CONFIG[0];
        const rankDisplay = index < 3 ? medals[index] : `${index + 1}.`;
        return `
            <div class="time-item" style="--timer-color: ${config.color}">
                <span class="rank">${rankDisplay}</span>
                <span class="emoji">${config.emoji}</span>
                <span class="key-badge" style="background: ${config.color}">${item.timer.toUpperCase()}</span>
                <span class="time-value">${formatTime(item.duration)}</span>
            </div>
        `;
    }).join('');
}
