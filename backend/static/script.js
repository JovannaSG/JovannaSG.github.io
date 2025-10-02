class TodoApp {
  constructor() {
    this.tasks = [];
    this.apiBase = ''; // Будет использоваться относительный путь

    this.initializeElements();
    this.loadTasks();
    this.setupEventListeners();
  }

  initializeElements() {
    this.taskInput = document.getElementById('taskInput');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.tasksList = document.getElementById('tasksList');
    this.totalTasks = document.getElementById('totalTasks');
    this.completedTasks = document.getElementById('completedTasks');
  }

  setupEventListeners() {
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
  }

  async loadTasks() {
    try {
      this.showLoading();
      const response = await fetch('/tasks');
      this.tasks = await response.json();
      this.renderTasks();
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
      this.showError('Не удалось загрузить задачи');
    }
  }

  async addTask() {
    const text = this.taskInput.value.trim();
    if (!text) return;

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          completed: false
        })
      });

      if (response.ok) {
        const newTask = await response.json();
        this.tasks.push(newTask);
        this.renderTasks();
        this.taskInput.value = '';
        this.taskInput.focus();
      }
    } catch (error) {
      console.error('Ошибка добавления задачи:', error);
      telegramApp.showAlert('Не удалось добавить задачу');
    }
  }

  async toggleTask(taskId) {
    try {
      const response = await fetch(`/tasks/${taskId}/toggle`, {
        method: 'PUT'
      });

      if (response.ok) {
        const updatedTask = await response.json();
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = updatedTask;
          this.renderTasks();
        }
      }
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.renderTasks();
      }
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      telegramApp.showAlert('Не удалось удалить задачу');
    }
  }

  renderTasks() {
    if (this.tasks.length === 0) {
      this.tasksList.innerHTML = '<div class="empty-state">Задач пока нет. Добавьте первую!</div>';
    } else {
      this.tasksList.innerHTML = this.tasks.map(task => `
                <div class="task-item">
                    <div class="task-content">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? 'checked' : ''}
                            onchange="todoApp.toggleTask(${task.id})"
                        >
                        <span class="task-text ${task.completed ? 'completed' : ''}">
                            ${this.escapeHtml(task.text)}
                        </span>
                    </div>
                    <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})">
                        Удалить
                    </button>
                </div>
            `).join('');
    }

    this.updateStats();
  }

  updateStats() {
    this.totalTasks.textContent = this.tasks.length;
    this.completedTasks.textContent = this.tasks.filter(t => t.completed).length;
  }

  showLoading() {
    this.tasksList.innerHTML = '<div class="loading">Загрузка задач...</div>';
  }

  showError(message) {
    this.tasksList.innerHTML = `<div class="empty-state">${message}</div>`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Инициализация приложения
const todoApp = new TodoApp();