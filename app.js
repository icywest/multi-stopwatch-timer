// ====== Utilities ======

// Format milliseconds to MM:SS.mmm
function formatTime(ms) {
  ms = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(milliseconds).padStart(3, '0');
  return `${mm}:${ss}.${mmm}`;
}

// Convert minutes and seconds to milliseconds
function parseTime(minutes, seconds) {
  return (Number(minutes) * 60 + Number(seconds)) * 1000;
}

// Create a DOM element with optional className and text
function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// ====== Countdown Model ======

// Factory to create a countdown/stopwatch object
function createTimer(id, type) {
  return {
    id: Number(id),
    type: type || 'stopwatch', // 'stopwatch' or 'countdown'
    startTime: null,           // timestamp when started
    pausedTime: 0,             // elapsed or remaining time
    targetTime: 0,             // for countdown: total duration
    isRunning: false,
    laps: [],
    element: null              // references to DOM elements
  };
}

// ====== Storage ======

// Save timers to localStorage
function saveToStorage(timers) {
  try {
    const data = [];
    timers.forEach(function(timer) {
      data.push({
        id: Number(timer.id),
        type: timer.type,
        pausedTime: timer.pausedTime,
        targetTime: timer.targetTime,
        laps: timer.laps
      });
    });
    localStorage.setItem('timers', JSON.stringify(data));
  } catch (e) {
    console.error('saveToStorage error', e);
  }
}

// Load timers from localStorage
function loadFromStorage() {
  const timers = new Map();
  try {
    const raw = localStorage.getItem('timers');
    if (!raw) return timers;

    const data = JSON.parse(raw || '[]');
    data.forEach(function(item) {
      const id = Number(item.id);
      const timer = createTimer(id, item.type || 'stopwatch');
      timer.pausedTime = Number(item.pausedTime) || 0;
      timer.targetTime = Number(item.targetTime) || 0;
      timer.laps = Array.isArray(item.laps) ? item.laps.map(Number) : [];
      timers.set(id, timer);
    });
  } catch (e) {
    console.error('Error loading timers:', e);
  }
  return timers;
}

// ====== Timer Card (DOM) ======

function createTimerCard(timer) {
  const card = createElement('div', 'timer-card');
  card.id = 'timer-' + timer.id;

  // Header with mode selector and delete button
  const header = createElement('div', 'timer-header');
  const modeSelect = createElement('select', 'mode-select');
  const opt1 = createElement('option'); opt1.value = 'stopwatch'; opt1.textContent = 'Stopwatch';
  const opt2 = createElement('option'); opt2.value = 'timer'; opt2.textContent = 'Countdown';
  modeSelect.appendChild(opt1); modeSelect.appendChild(opt2);
  modeSelect.value = timer.type;

  const deleteBtn = createElement('button', 'delete-btn', '×');
  header.appendChild(modeSelect);
  header.appendChild(deleteBtn);

  // Display area
  const display = createElement('div', 'time-display',
    formatTime(timer.type === 'timer' ? (timer.targetTime || 0) : (timer.pausedTime || 0))
  );

  // Inputs for countdown duration
  const timerInputs = createElement('div', 'timer-inputs');
  const minutesInput = createElement('input', 'minutes-input');
  minutesInput.type = 'number'; minutesInput.placeholder = 'MM'; minutesInput.min = '0'; minutesInput.max = '99';
  const sep = createElement('span', null, ':');
  const secondsInput = createElement('input', 'seconds-input');
  secondsInput.type = 'number'; secondsInput.placeholder = 'SS'; secondsInput.min = '0'; secondsInput.max = '59';
  const setBtn = createElement('button', 'set-btn', 'Set');
  timerInputs.appendChild(minutesInput); timerInputs.appendChild(sep); timerInputs.appendChild(secondsInput); timerInputs.appendChild(setBtn);
  if (timer.type !== 'timer') timerInputs.style.display = 'none';

  // Controls: Start, Lap, Reset
  const controls = createElement('div', 'controls');
  const startBtn = createElement('button', 'control-btn start', 'Start');
  const lapBtn = createElement('button', 'control-btn', 'Lap'); lapBtn.disabled = true;
  const resetBtn = createElement('button', 'control-btn reset', 'Reset');
  controls.appendChild(startBtn); controls.appendChild(lapBtn); controls.appendChild(resetBtn);

  // Laps container
  const lapsContainer = createElement('div', 'laps'); lapsContainer.style.display = 'none';

  // Assemble card
  card.appendChild(header); card.appendChild(display); card.appendChild(timerInputs); card.appendChild(controls); card.appendChild(lapsContainer);

  // Store references
  timer.element = { card, display, startBtn, lapBtn, resetBtn, deleteBtn, setBtn, modeSelect, timerInputs, minutesInput, secondsInput, lapsContainer };

  // Initial lap state
  if (timer.type === 'stopwatch') {
    lapBtn.disabled = !timer.isRunning;
  } else {
    lapBtn.disabled = true;
  }

  return card;
}

// ====== Core Logic ======

// Get current time: elapsed for stopwatch, remaining for countdown
function getCurrentTime(timer) {
  if (!timer.isRunning) {
    if (Number(timer.pausedTime) > 0) return Number(timer.pausedTime);
    return timer.type === 'timer' ? Number(timer.targetTime || 0) : 0;
  }
  const elapsed = Date.now() - Number(timer.startTime || 0);
  if (timer.type === 'stopwatch') return elapsed;
  return Math.max(0, Number(timer.targetTime || 0) - elapsed);
}

// Start a timer or countdown
function startTimer(timer) {
  if (timer.type === 'stopwatch') {
    timer.startTime = Date.now() - (Number(timer.pausedTime) || 0);
  } else {
    // countdown: calculate remaining time
    const remaining = Number(timer.pausedTime) || Number(timer.targetTime);
    timer.startTime = Date.now() - (Number(timer.targetTime) - remaining);
  }
  timer.isRunning = true;
  timer.element.startBtn.textContent = 'Pause';
  timer.element.lapBtn.disabled = (timer.type !== 'stopwatch');
}

// Pause a timer or countdown
function pauseTimer(timer) {
  timer.pausedTime = getCurrentTime(timer);
  timer.isRunning = false;
  timer.element.startBtn.textContent = 'Start';
  timer.element.lapBtn.disabled = true;
}

// Reset timer or countdown
function resetTimer(timer) {
  timer.startTime = null; timer.pausedTime = 0; timer.isRunning = false; timer.laps = [];
  timer.element.startBtn.textContent = 'Start'; timer.element.lapBtn.disabled = true;
  updateDisplay(timer); updateLaps(timer);
}

// Add a lap for stopwatch
function addLap(timer) {
  if (!timer.isRunning || timer.type !== 'stopwatch') return;
  timer.laps.push(getCurrentTime(timer));
  updateLaps(timer);
}

// Update displayed time and handle countdown expiration
function updateDisplay(timer) {
  if (!timer.element) return;

  const time = getCurrentTime(timer);
  timer.element.display.textContent = formatTime(time);

  if (timer.type === 'timer' && time === 0 && Number(timer.targetTime) > 0) {
    timer.element.card.classList.add('expired');

    if (!timer.element.expiredMsg) {
      const msg = createElement('div', 'expired-message', "Time's Up!");
      timer.element.display.insertAdjacentElement('afterend', msg);
      timer.element.expiredMsg = msg;
    }

    if (timer.element.startBtn) timer.element.startBtn.disabled = true;
  } else {
    timer.element.card.classList.remove('expired');
    if (timer.element.expiredMsg) {
      timer.element.expiredMsg.remove();
      timer.element.expiredMsg = null;
    }
    if (timer.element.startBtn && !timer.isRunning) {
      timer.element.startBtn.disabled = false;
    }
  }
}

// Update laps container
function updateLaps(timer) {
  const c = timer.element.lapsContainer;
  while (c.firstChild) c.removeChild(c.firstChild);
  if (!timer.laps || timer.laps.length === 0) { c.style.display = 'none'; return; }
  c.style.display = 'block';
  const title = createElement('h4', null, 'Laps'); c.appendChild(title);
  timer.laps.forEach(function(lap, i) {
    const d = createElement('div', 'lap', `Lap ${i + 1}: ${formatTime(lap)}`);
    c.appendChild(d);
  });
}

// ====== App Logic ======

function createApp() {
  const timers = loadFromStorage();
  let nextId = 1;
  if (timers.size > 0) nextId = Math.max(...Array.from(timers.keys()).map(Number)) + 1;
  const intervals = new Map();
  const container = document.getElementById('timers-container');

  // Update loop per timer
  function updateTimerLoop(timer) {
    const time = getCurrentTime(timer);
    updateDisplay(timer);
    if (timer.type === 'timer' && time === 0) {
      pauseTimer(timer);
      if (intervals.has(timer.id)) { clearInterval(intervals.get(timer.id)); intervals.delete(timer.id); }
      if (timer.element && timer.element.startBtn) timer.element.startBtn.disabled = true;
      saveToStorage(timers);
    }
  }

  // Add a new timer or countdown
  function addTimer(type) {
    const timer = createTimer(nextId++, type);
    timers.set(timer.id, timer);
    const card = createTimerCard(timer);
    container.appendChild(card);
    attachEventListeners(timer);
    updateDisplay(timer);
    saveToStorage(timers);
  }

  // Remove a timer/countdown
  function removeTimer(timer) {
    if (!confirm(`Delete this ${timer.type}?`)) return;
    if (intervals.has(timer.id)) { clearInterval(intervals.get(timer.id)); intervals.delete(timer.id); }
    if (timer.element && timer.element.card) timer.element.card.remove();
    timers.delete(timer.id);
    saveToStorage(timers);
  }

  // Switch between stopwatch and countdown
  function switchMode(timer, newMode) {
    if (timer.isRunning) { pauseTimer(timer); if (intervals.has(timer.id)) { clearInterval(intervals.get(timer.id)); intervals.delete(timer.id); } }
    timer.type = newMode; timer.targetTime = 0; resetTimer(timer);
    if (timer.element) timer.element.timerInputs.style.display = (newMode === 'timer') ? 'flex' : 'none';
    saveToStorage(timers);
  }

  // Set countdown duration
  function setTimerDuration(timer) {
    const mins = parseInt(timer.element.minutesInput.value) || 0;
    const secs = parseInt(timer.element.secondsInput.value) || 0;
    if (mins === 0 && secs === 0) return;
    if (secs >= 60) { alert('Seconds must be less than 60'); return; }
    resetTimer(timer);
    timer.targetTime = parseTime(mins, secs);
    timer.pausedTime = timer.targetTime;
    updateDisplay(timer);
    timer.element.minutesInput.value = '';
    timer.element.secondsInput.value = '';
    if (timer.element.startBtn) timer.element.startBtn.disabled = false;
    saveToStorage(timers);
  }

  // Attach DOM event listeners
  function attachEventListeners(timer) {
    timer.element.startBtn.addEventListener('click', function() {
      if (timer.isRunning) {
        pauseTimer(timer);
        if (intervals.has(timer.id)) { clearInterval(intervals.get(timer.id)); intervals.delete(timer.id); }
      } else {
        startTimer(timer);
        intervals.set(timer.id, setInterval(function() { updateTimerLoop(timer); }, 50));
      }
      saveToStorage(timers);
    });

    timer.element.lapBtn.addEventListener('click', function() { addLap(timer); saveToStorage(timers); });
    timer.element.resetBtn.addEventListener('click', function() {
      if (timer.isRunning) { if (intervals.has(timer.id)) { clearInterval(intervals.get(timer.id)); intervals.delete(timer.id); } }
      resetTimer(timer); if (timer.element && timer.element.startBtn) timer.element.startBtn.disabled = false; saveToStorage(timers);
    });
    timer.element.modeSelect.addEventListener('change', function(e) { switchMode(timer, e.target.value); });
    timer.element.deleteBtn.addEventListener('click', function() { removeTimer(timer); });
    timer.element.setBtn.addEventListener('click', function() { setTimerDuration(timer); });
  }

  // Initialize saved timers
  timers.forEach(function(timer) {
    const card = createTimerCard(timer);
    container.appendChild(card);
    attachEventListeners(timer);
    updateDisplay(timer);
    if (timer.laps && timer.laps.length > 0) updateLaps(timer);
  });

  // Add new countdown/timer button
  document.getElementById('add-timer-btn').addEventListener('click', function() {
    const type = document.getElementById('timer-type-select').value || 'stopwatch';
    addTimer(type);
  });

  // Clear all saved timers
  document.getElementById('clear-storage-btn').addEventListener('click', function() {
    if (confirm('Clear saved timers?')) { localStorage.removeItem('timers'); location.reload(); }
  });

  if (!container) console.warn('timers-container element not found');
}