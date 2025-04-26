// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
  const timerDisplay = document.getElementById('timer');
  const presetButtons = document.getElementById('preset-buttons');
  const showCustomBtn = document.getElementById('show-custom-btn');
  const customTimeInputDiv = document.getElementById('custom-time-input');
  const customMinutesInput = document.getElementById('custom-minutes');
  const setCustomTimeBtn = document.getElementById('set-custom-time-btn');
  const startPauseBtn = document.getElementById('start-pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const taskInput = document.getElementById('new-task');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');

  // --- Timer State ---
  let timerInterval = null;
  let totalSeconds = 0; // Start with 0 seconds initially
  let isRunning = false;

  // --- Timer Functions ---

  function updateTimerDisplay() {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    // Only show hours if there are any
    timerDisplay.textContent = hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;

     // Update title for browser tab
     document.title = `${timerDisplay.textContent} - Focus Timer`;
  }

  function setTimer(seconds) {
      if (isRunning) {
          pauseTimer(); // Stop any running timer first
      }
      totalSeconds = seconds;
      // If we wanted 'Reset' to go back to the last set time, we'd keep initialTotalSeconds here
      // initialTotalSeconds = seconds;
      updateTimerDisplay();
      updateTimerStateClass('initial'); // Use 'initial' state class for color
      updateButtonVisibility(); // Ensure buttons are correct after setting
  }

  function startTimer() {
      // Only start if not already running and time is set
      if (isRunning || totalSeconds <= 0) return;

      isRunning = true;
      updateButtonVisibility(); // Update button state to show Pause/Reset
      updateTimerStateClass('running'); // Update timer color/style

      timerInterval = setInterval(() => {
          if (totalSeconds > 0) {
              totalSeconds--;
              updateTimerDisplay();
          } else {
              // Timer finished
              clearInterval(timerInterval);
              timerInterval = null;
              isRunning = false;
              updateTimerStateClass('finished'); // Update timer color/style
              updateButtonVisibility(); // Update button state to show presets/custom
              alert("⏰ Time's up!"); // Consider a more subtle notification
               document.title = "Time's up! - Focus Timer";
          }
      }, 1000);
  }

  function pauseTimer() {
      if (!isRunning || !timerInterval) return; // Only pause if running

      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      updateTimerStateClass('paused'); // Update timer color/style
      updateButtonVisibility(); // Update button state to show Start/Reset
       document.title = `Paused - ${timerDisplay.textContent}`;
  }

  function resetTimer() {
      pauseTimer(); // Stop timer if running
      // --- FIX: Reset totalSeconds to 0 to bring back time selection ---
      totalSeconds = 0;
      // If we had kept initialTotalSeconds and wanted reset to go back to THAT time:
      // totalSeconds = initialTotalSeconds;
      // ------------------------------------------------------------------
      updateTimerDisplay();
      // Set state back to initial (or paused if you reset to a non-zero number)
      updateTimerStateClass('initial');
      // Update buttons - this will now correctly show presets/custom because totalSeconds is 0
      updateButtonVisibility();
      document.title = "Minimal Focus Timer & To-Do"; // Reset title
  }

  function updateButtonVisibility() {
      // Hide all timer control buttons first for clarity
      startPauseBtn.classList.add('hidden');
      resetBtn.classList.add('hidden');
      presetButtons.classList.add('hidden');
      showCustomBtn.classList.add('hidden');
      customTimeInputDiv.classList.add('hidden'); // Custom input is only shown when requested

      if (isRunning) {
          startPauseBtn.textContent = 'Pause';
          startPauseBtn.classList.remove('hidden');
          resetBtn.classList.remove('hidden'); // Reset is available while running
      } else { // Not running (initial, paused, or finished)
          startPauseBtn.textContent = 'Start';

          if (totalSeconds <= 0) {
             // Timer is at 0 (initial or after reset/finish) - time needs to be set
             presetButtons.classList.remove('hidden'); // Show presets
             showCustomBtn.classList.remove('hidden'); // Show Custom button
             // Start/Reset buttons remain hidden until a time is selected/set
          } else {
            // Timer has a value > 0 but is paused
            startPauseBtn.classList.remove('hidden'); // Show Start (to resume)
            resetBtn.classList.remove('hidden'); // Show Reset (to clear and pick new)
             // Presets/Custom are hidden while a time is already set/paused
          }
      }
  }

  function updateTimerStateClass(state) {
      timerDisplay.classList.remove('running', 'paused', 'finished', 'initial');
      if (state !== 'initial') {
         timerDisplay.classList.add(state);
      }
      // Ensure the initial state class is added for styling if needed
      if (state === 'initial' && totalSeconds > 0) {
           // Optional: Add a class if it's initial BUT a time is loaded
           // timerDisplay.classList.add('time-set');
           // For now, we just rely on the lack of other state classes
      }
  }


  // --- Event Listeners for Timer ---

   // Preset buttons: Use event delegation on the container
   presetButtons.addEventListener('click', (event) => {
       const button = event.target.closest('button'); // Get the clicked button or its closest ancestor button
       if (button && button.dataset.minutes) {
           const minutes = parseInt(button.dataset.minutes);
           setTimer(minutes * 60); // Set the timer
           // updateButtonVisibility() is called inside setTimer now
       }
   });

  // Show custom input
  showCustomBtn.addEventListener('click', () => {
      presetButtons.classList.add('hidden');
      showCustomBtn.classList.add('hidden');
      customTimeInputDiv.classList.remove('hidden');
      // Start/Reset buttons should not be visible while setting custom time
      startPauseBtn.classList.add('hidden');
      resetBtn.classList.add('hidden');
      customMinutesInput.focus(); // Focus the input
  });

  // Set custom time
  setCustomTimeBtn.addEventListener('click', () => {
      const minutes = parseInt(customMinutesInput.value);
      if (minutes > 0) {
          setTimer(minutes * 60); // Set the timer
          // updateButtonVisibility() is called inside setTimer now
          customTimeInputDiv.classList.add('hidden'); // Hide the custom input after setting
      } else {
          alert("Please enter a valid number of minutes.");
          customMinutesInput.focus(); // Keep focus on input if invalid
      }
  });

  // Handle Enter key in custom input
  customMinutesInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
      setCustomTimeBtn.click(); // Trigger the set button click
    }
  });


  // Start/Pause button
  startPauseBtn.addEventListener('click', () => {
      if (isRunning) {
          pauseTimer();
      } else {
          startTimer();
      }
  });

  // Reset button
  resetBtn.addEventListener('click', resetTimer);


  // --- To-Do List Functions ---

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="task-text">${taskText}</span>
        <div class="todo-actions">
          <button class="complete-btn" aria-label="Complete Task">✅</button>
          <button class="delete-btn" aria-label="Delete Task">❌</button>
        </div>
      `;
      taskList.appendChild(li);
      taskInput.value = ''; // Clear the input field
      taskInput.focus(); // Put focus back on the input for quick entry
    }
  }

  // Use event delegation for task actions on the task list container
  taskList.addEventListener('click', (event) => {
      const target = event.target;
      // Use closest to find the button or its ancestor li, handling clicks on icons inside buttons
      const completeButton = target.closest('.complete-btn');
      const deleteButton = target.closest('.delete-btn');
      const listItem = target.closest('li');

      if (!listItem) return; // Click was not inside an li

      if (completeButton) {
          listItem.querySelector('.task-text').classList.toggle('completed');
      } else if (deleteButton) {
          listItem.remove();
      }
  });

  // Add task on button click
  addTaskBtn.addEventListener('click', addTask);

  // Add task on Enter key in input field
  taskInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          event.preventDefault(); // Prevent default form submission
          addTask();
      }
  });


  // --- Initialization ---

  // Set initial display, state, and button visibility
  // Instead of starting with 25min set, start with 0 and show presets
  // setTimer(25 * 60); // Removed this line
  totalSeconds = 0; // Ensure it starts at 0
  updateTimerDisplay();
  updateTimerStateClass('initial');
  updateButtonVisibility(); // This will hide Start/Pause/Reset and show presets initially

  // Add a default task (optional)
  // addTask('Example Task 1');
  // addTask('Example Task 2');
});