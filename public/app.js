document.addEventListener('DOMContentLoaded', () => {
  const API_URL = ''; // Relative path to API
  const statusEl = document.getElementById('api-status');
  const countsEl = document.getElementById('task-counts');
  const todoListEl = document.getElementById('todo-list');
  const doneListEl = document.getElementById('done-list');
  const errorEl = document.getElementById('error-message');
  const addTaskBtn = document.getElementById('add-task-btn');
  const newTaskInput = document.getElementById('new-task-title');

  // --- API Functions ---
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        statusEl.textContent = 'Online';
        statusEl.className = 'online';
      } else {
        throw new Error('API not responding');
      }
    } catch (error) {
      statusEl.textContent = 'Offline';
      statusEl.className = 'offline';
      console.error('API health check failed:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const tasks = await response.json();
      renderTasks(tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      showError('Could not load tasks from the server.');
    }
  };

  const createTask = async (title) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        await fetchTasks(); // Re-fetch to display the new task
        newTaskInput.value = '';
        hideError();
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      showError('Could not connect to the server to create task.');
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}/toggle`, { method: 'PATCH' });
      await fetchTasks(); // Re-fetch to update UI
    } catch (error) {
      console.error('Failed to toggle task:', error);
      showError('Could not update task on the server.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTasks(); // Re-fetch to update UI
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to delete task.');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      showError('Could not connect to the server to delete task.');
    }
  };

  // --- UI Functions ---
  const renderTasks = (tasks) => {
    todoListEl.innerHTML = '';
    doneListEl.innerHTML = '';
    let todoCount = 0;
    let doneCount = 0;

    tasks.forEach(task => {
      const taskEl = document.createElement('li');
      taskEl.className = 'task-item';
      if (task.done) {
        taskEl.classList.add('done');
        doneCount++;
      } else {
        todoCount++;
      }

      taskEl.innerHTML = `
        <input type="checkbox" data-id="${task.id}" ${task.done ? 'checked' : ''}>
        <span>${task.title}</span>
        <button class="delete-btn" data-id="${task.id}">&times;</button>
      `;

      if (task.done) {
        doneListEl.appendChild(taskEl);
      } else {
        todoListEl.appendChild(taskEl);
      }
    });

    countsEl.textContent = `${todoCount} todo • ${doneCount} done`;
  };

  const showError = (message) => {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  };

  const hideError = () => {
    errorEl.style.display = 'none';
  };

  // --- Event Listeners ---
  addTaskBtn.addEventListener('click', () => {
    const title = newTaskInput.value;
    if (title) {
      createTask(newTaskInput.value); // Send original value to test backend validation
    } else {
      showError('Title cannot be empty.');
    }
  });

  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTaskBtn.click();
    }
  });

  // Use event delegation for checkbox clicks
  document.body.addEventListener('change', (e) => {
    if (e.target.matches('.task-item input[type="checkbox"]')) {
      const id = parseInt(e.target.dataset.id, 10);
      toggleTaskStatus(id);
    }
  });

  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.delete-btn')) {
      const id = parseInt(e.target.dataset.id, 10);
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(id);
      }
    }
  });

  // --- Initial Load ---
  checkApiStatus();
  fetchTasks();
});
