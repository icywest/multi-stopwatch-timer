// Helper function to format time
function format(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const mmm = String(ms % 1000).padStart(3, '0');
  return `${mm}:${ss}.${mmm}`;
}

// Stopwatch counter for unique IDs
let stopwatchID = 0;

// Stopwatch class
class Stopwatch {
  constructor(id) {
    this.id = id;
    this.startTs = null;
    this.elapsed = 0;
    this.timerId = null;
    this.laps = [];
    this.mode = 'stopwatch'; // 'stopwatch' or 'countdown'
    this.countdownTime = 0;
    this.element = null;
  }

  createElement() {
    const div = document.createElement('div');
    div.className = 'stopwatch';
    div.id = `stopwatch-${this.id}`;

    // Construimos el contenido sin innerHTML
    const header = document.createElement('div');
    header.className = 'stopwatch-header';

    const title = document.createElement('h3');
    title.className = 'stopwatch-title';
    title.textContent = `Stopwatch ${this.id}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Delete';

    header.appendChild(title);
    header.appendChild(delBtn);

    const modeIndicator = document.createElement('div');
    modeIndicator.className = 'mode-indicator';
    modeIndicator.textContent = 'Mode: Stopwatch';

    const display = document.createElement('div');
    display.className = 'display';
    display.textContent = '00:00.000';

    const controls = document.createElement('div');
    controls.className = 'controls';

    const startBtn = document.createElement('button');
    startBtn.className = 'start';
    startBtn.textContent = 'Start';

    const lapBtn = document.createElement('button');
    lapBtn.className = 'lap';
    lapBtn.textContent = 'Lap';
    lapBtn.disabled = true;

    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset';
    resetBtn.textContent = 'Reset';

    controls.append(startBtn, lapBtn, resetBtn);

    const countdownSection = document.createElement('div');
    countdownSection.className = 'countdown-section';

    const countdownInput = document.createElement('input');
    countdownInput.className = 'countdown-input';
    countdownInput.placeholder = 'MM:SS';

    const setBtn = document.createElement('button');
    setBtn.className = 'set';
    setBtn.textContent = 'Set Countdown';

    countdownSection.append(countdownInput, setBtn);

    const lapsContainer = document.createElement('div');
    lapsContainer.className = 'laps-container';

    div.append(header, modeIndicator, display, controls, countdownSection, lapsContainer);

    this.element = div;
    this.attachEventListeners();
    return div;
  }

  attachEventListeners() {
    const startBtn = this.element.querySelector('.start');
    const lapBtn = this.element.querySelector('.lap');
    const resetBtn = this.element.querySelector('.reset');
    const setBtn = this.element.querySelector('.set');
    const deleteBtn = this.element.querySelector('.delete-btn');
    const countdownInput = this.element.querySelector('.countdown-input');

    startBtn.addEventListener('click', () => this.toggleStartPause());
    lapBtn.addEventListener('click', () => this.addLap());
    resetBtn.addEventListener('click', () => this.reset());
    setBtn.addEventListener('click', () => this.setCountdown());
    deleteBtn.addEventListener('click', () => this.delete());
    
    // Allow Enter key to set countdown
    countdownInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.setCountdown();
    });
  }

  toggleStartPause() {
    const startBtn = this.element.querySelector('.start');
    const lapBtn = this.element.querySelector('.lap');

    if (this.timerId) {
      this.pause();
      startBtn.textContent = 'Start';
      lapBtn.disabled = true;
    } else {
      this.start();
      startBtn.textContent = 'Pause';
      lapBtn.disabled = false;
    }
  }

  start() {
    if (this.mode === 'stopwatch') {
      this.startTs = Date.now() - this.elapsed;
    } else {
      this.startTs = Date.now() + this.elapsed;
    }
    this.timerId = setInterval(() => this.tick(), 16);
  }

  pause() {
    clearInterval(this.timerId);
    this.timerId = null;
  }

  tick() {
    const display = this.element.querySelector('.display');
    
    if (this.mode === 'stopwatch') {
      this.elapsed = Date.now() - this.startTs;
      display.textContent = format(this.elapsed);
    } else {
      const remaining = this.startTs - Date.now();
      if (remaining <= 0) {
        this.elapsed = 0;
        display.textContent = '00:00.000';
        this.pause();
        this.timesUp();
      } else {
        this.elapsed = remaining;
        display.textContent = format(remaining);
      }
    }
  }

  timesUp() {
    this.element.classList.add('times-up');
    const message = document.createElement('div');
    message.className = 'times-up-message';
    message.textContent = "Time's up!";
    this.element.querySelector('.display').after(message);
    this.element.querySelector('.start').disabled = true;
    this.element.querySelector('.lap').disabled = true;
  }

  reset() {
    this.pause();
    this.elapsed = 0;
    this.startTs = null;
    this.laps = [];
    this.element.querySelector('.display').textContent = '00:00.000';

    const startBtn = this.element.querySelector('.start');
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
    this.element.querySelector('.lap').disabled = true;

    const lapsContainer = this.element.querySelector('.laps-container');
    lapsContainer.textContent = '';

    this.element.classList.remove('times-up');
    const timesUpMsg = this.element.querySelector('.times-up-message');
    if (timesUpMsg) timesUpMsg.remove();

    this.mode = 'stopwatch';
    this.element.querySelector('.mode-indicator').textContent = 'Mode: Stopwatch';
  }

  addLap() {
    if (this.mode !== 'stopwatch' || !this.timerId) return;
    this.laps.push(this.elapsed);
    this.renderLaps();
  }

  renderLaps() {
    const container = this.element.querySelector('.laps-container');
    container.textContent = '';

    if (this.laps.length === 0) return;

    const ul = document.createElement('ul');
    ul.className = 'laps';

    const header = document.createElement('h4');
    header.textContent = 'Laps';
    ul.appendChild(header);

    this.laps.forEach((lap, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}) ${format(lap)}`;
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  setCountdown() {
    const input = this.element.querySelector('.countdown-input');
    const value = input.value.trim();
    const match = value.match(/^(\d{1,2}):(\d{1,2})$/);
    if (!match) {
      alert('Please enter time in MM:SS format (e.g., 02:30)');
      return;
    }
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);

    if (seconds >= 60) {
      alert('Seconds must be less than 60');
      return;
    }
    this.reset();

    this.mode = 'countdown';
    this.element.querySelector('.mode-indicator').textContent = 'Mode: Countdown';

    const totalMs = (minutes * 60 + seconds) * 1000;
    this.elapsed = totalMs;
    this.countdownTime = totalMs;
    this.element.querySelector('.display').textContent = format(totalMs);

    input.value = '';
  }

  delete() {
    if (confirm(`Delete Stopwatch ${this.id}?`)) {
      this.pause();
      this.element.remove();
    }
  }
}

// Main app logic
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add');
  const app = document.getElementById('app');
  
  addBtn.addEventListener('click', () => {
    stopwatchID++;
    const stopwatch = new Stopwatch(stopwatchID);
    app.appendChild(stopwatch.createElement());
  });
  
  addBtn.click();
});
