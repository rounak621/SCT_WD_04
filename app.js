// Task data structure
class Task {
    constructor(title, description = '', dateTime = '', completed = false) {
        this.id = Date.now().toString();
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.completed = completed;
    }
}

// Main app class
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // DOM Elements
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.tasksContainer = document.querySelector('.tasks-container');
        this.dateDisplay = document.querySelector('.date-display');
        this.modal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-form');
        this.editTitle = document.getElementById('edit-title');
        this.editDescription = document.getElementById('edit-description');
        this.editDateTime = document.getElementById('edit-datetime');
        
        // Event Listeners
        this.todoForm.addEventListener('submit', this.addTask.bind(this));
        this.editForm.addEventListener('submit', this.updateTask.bind(this));
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        
        // Initialize
        this.updateDateDisplay();
        this.renderTasks();
        setInterval(() => this.updateDateDisplay(), 60000); // Update time every minute

        // Apply theme class
        document.body.classList.add('dark-theme');
    }

    updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        // Clear existing tasks
        const tasksElements = this.tasksContainer.querySelectorAll('.task-item');
        tasksElements.forEach(task => task.remove());

        // Show/hide empty state
        const emptyState = this.tasksContainer.querySelector('.empty-state');
        if (this.tasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        // Render tasks
        this.tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.style.animationDelay = `${index * 0.1}s`; // Stagger animation
            taskElement.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                     onclick="app.toggleTask('${task.id}')"></div>
                <div class="task-content ${task.completed ? 'completed' : ''}">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    ${task.dateTime ? `<div class="task-datetime">
                        <span class="material-icons">event</span>
                        ${new Date(task.dateTime).toLocaleString()}
                    </div>` : ''}
                </div>
                <div class="task-actions">
                    <button onclick="app.editTask('${task.id}')" title="Edit task">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="delete-btn" onclick="app.deleteTask('${task.id}')" title="Delete task">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            `;
            this.tasksContainer.appendChild(taskElement);
        });
    }

    addTask(e) {
        e.preventDefault();
        const title = this.todoInput.value.trim();
        if (title) {
            const task = new Task(title);
            this.tasks.unshift(task); // Add to beginning of array
            this.saveTasks();
            this.renderTasks();
            this.todoInput.value = '';
            
            // Add highlight animation to new task
            const newTaskElement = this.tasksContainer.querySelector('.task-item');
            if (newTaskElement) {
                newTaskElement.style.animation = 'none';
                newTaskElement.offsetHeight; // Trigger reflow
                newTaskElement.style.animation = 'slideIn 0.3s ease, glow 2s ease';
            }
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();

            // Add completion animation
            const taskElement = this.tasksContainer.querySelector(`[data-task-id="${id}"]`);
            if (taskElement) {
                taskElement.classList.add('task-toggle-animation');
                setTimeout(() => taskElement.classList.remove('task-toggle-animation'), 500);
            }
        }
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            const taskElement = this.tasksContainer.querySelectorAll('.task-item')[index];
            taskElement.style.animation = 'slideOut 0.3s ease forwards';
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveTasks();
                this.renderTasks();
            }, 300);
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editTitle.value = task.title;
            this.editDescription.value = task.description || '';
            this.editDateTime.value = task.dateTime || '';
            this.editForm.dataset.taskId = id;
            this.openModal();
        }
    }

    updateTask(e) {
        e.preventDefault();
        const id = this.editForm.dataset.taskId;
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.title = this.editTitle.value.trim();
            task.description = this.editDescription.value.trim();
            task.dateTime = this.editDateTime.value;
            this.saveTasks();
            this.renderTasks();
            this.closeModal();
        }
    }

    openModal() {
        this.modal.classList.add('active');
        setTimeout(() => this.editTitle.focus(), 100);
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.editForm.reset();
    }
}

// Initialize app
const app = new TodoApp();

// Add some sample tasks if none exist
if (!localStorage.getItem('tasks')) {
    app.tasks = [
        new Task('Welcome to your Todo App! 👋', 'Try adding a new task using the input field above.', '', false),
        new Task('You can edit tasks ✏️', 'Click the edit button to modify task details and set date/time.', '', false),
        new Task('Mark tasks as complete ✅', 'Click the checkbox to toggle task completion.', '', true)
    ];
    app.saveTasks();
    app.renderTasks();
}

// Add keydown event listener for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('edit-modal').classList.contains('active')) {
        app.closeModal();
    }
});
