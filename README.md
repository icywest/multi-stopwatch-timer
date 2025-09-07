# Multi-Stopwatch & Countdown Timer App

A vanilla JavaScript application for managing multiple independent stopwatches and countdown timers with a clean, intuitive interface.

---
## Overview

This project creates a **dynamic multi-stopwatch/timer application** where users can:

* Add multiple stopwatch or countdown timer cards dynamically
* Run timers independently and simultaneously
* Track lap times for each stopwatch
* Set custom countdown durations
* Persist all data across browser sessions
---

## Features

### Core Features (MVP)

* **Dynamic Card Creation**: Add unlimited stopwatch or countdown cards
* **Independent Operation**: Each timer runs completely independently
* **Dual Modes**: Stopwatch and Countdown modes toggle per card
* **Time Display**: MM\:SS.mmm format (e.g., 02:07.245)
* **Stopwatch Controls**:

  * Start/Pause toggle with dynamic button text
  * Reset clears time and laps
  * Lap recording with numbered list display
* **Countdown Timer**:

  * Set custom start time in minutes/seconds
  * Automatic stop at 00:00.000
  * Visual "Time’s Up!" notification with color change and message
  * Start button disabled once timer expires

### Challenge Features Implemented

* **Delete Cards**: Remove any card with confirmation prompt
* **Persistent Storage**: Timers, laps, and states saved in `localStorage`
* **Rename Timers**: Inline editable titles (press Enter to save, Escape to cancel)
* **Mode Switching**: Seamlessly switch between Stopwatch and Countdown
* **Clear All**: Remove all saved timers with confirmation
---

## How to Use

### Getting Started

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Select "Stopwatch" or "Countdown Timer" from the dropdown
4. Click **Add New** to create your first timer

### Stopwatch Mode

1. Click **Start** to begin timing
2. Click **Pause** to temporarily stop
3. Click **Lap** while running to record lap times
4. Click **Reset** to clear everything and return to 00:00.000

### Countdown Mode

1. Enter minutes and seconds in the input fields
2. Click **Set** to define countdown duration
3. Click **Start** to begin countdown
4. Timer stops automatically at 00:00.000 and shows visual alert
5. Click **Reset** to clear the expired state

### Managing Cards

* **Rename**: Click timer title to edit
* **Switch Modes**: Use the dropdown to change mode
* **Delete**: Click the × button (with confirmation)
* **Clear All**: Remove all saved timers
---

## Technical Details

### File Structure

```
├── index.html    # Main HTML structure
├── style.css     # Styling for all components
└── app.js        # Core JavaScript logic
```

### Key Technologies

* **Vanilla JavaScript**: No frameworks or dependencies
* **localStorage API**: Persistent data storage
* **DOM Manipulation**: Dynamic element creation and updates
* **setInterval**: Smooth updates (\~50ms per tick / 20 FPS)

### Time Formatting

* Minutes (MM): 00–99
* Seconds (SS): 00–59
* Milliseconds (mmm): 000–999

---

## Data Persistence

* Timer types (stopwatch/countdown)
* Current time and paused values
* Custom titles
* Recorded laps
* Timer running state

All timers will appear exactly as they were left when returning to the page.

---

## Known Issues / Limitations

* Countdown disables **Start** when expired; requires **Reset** to restart
* Lap button only works for stopwatches, not countdowns
* Maximum 99 minutes per timer
* Seconds input limited to 0–59
* No drag-and-drop reordering yet
* No keyboard shortcuts implemented
* Performance may degrade slightly with many timers due to multiple `setInterval` calls

---

## Challenges & Experience

* Managing multiple **independent timers** highlighted the need for clear **state management**
* Countdown behavior required careful handling of **expiration logic** and **visual cues**
* Persisting laps and timer states in `localStorage` required structured data storage
* Learned **best practices** for DOM manipulation.

---

## Running the Application

1. Clone or download the repo
2. Open `index.html` in any modern browser
3. No build or server required

### Browser Compatibility

* Chrome / Edge: ✅ Full support
* Firefox: ✅ Full support
* Safari: ✅ Full support