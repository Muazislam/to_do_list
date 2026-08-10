let tasks = [];
let currentFilter = 'all';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('[data-filter]');

function loadTasks() {
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter((t) => !t.completed);
    if (currentFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
}

function render() {
    list.innerHTML = '';

    const filtered = getFilteredTasks();

    filtered.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'list-group-item' + (task.completed ? ' completed-task' : '');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;
        span.draggable = false;
        span.addEventListener('dblclick', (e) => startEdit(li, span, task));

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary border-0';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.setAttribute('aria-label', 'Edit task');
        editBtn.addEventListener('click', () => startEdit(li, span, task));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger border-0';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.append(checkbox, span, editBtn, deleteBtn);
        list.appendChild(li);
    });

    const activeCount = tasks.filter((t) => !t.completed).length;
    taskCount.textContent = `${activeCount} of ${tasks.length} task${tasks.length === 1 ? '' : 's'} remaining`;

    emptyState.classList.toggle('d-none', filtered.length > 0);
    list.classList.toggle('d-none', filtered.length === 0);
    clearCompletedBtn.classList.toggle('d-none', !tasks.some((t) => t.completed));
}

function addTask(text) {
    tasks.unshift({ id: Date.now(), text, completed: false });
    saveTasks();
    render();
}

function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
}

function startEdit(li, span, task) {
    if (span.querySelector('input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control form-control-sm';
    input.value = task.text;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.classList.add('d-none');

    span.replaceWith(input);
    input.focus();
    input.setSelectionRange(0, input.value.length);

    let done = false;
    const finish = (save) => {
        if (done) return;
        done = true;
        const text = save ? input.value.trim() : task.text;
        if (noChange(save, task, input)) {
            restore(li, input, task, checkbox);
            return;
        }
        if (text) {
            task.text = text;
            saveTasks();
        }
        restore(li, input, task, checkbox);
        render();
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
    li.querySelectorAll('.btn').forEach((btn) => (btn.disabled = true));
}

function noChange(save, task, input) {
    return save && input.value.trim() === task.text;
}

function restore(li, input, task, checkbox) {
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    span.addEventListener('dblclick', () => startEdit(li, span, task));
    input.replaceWith(span);
    checkbox.classList.remove('d-none');
    li.querySelectorAll('.btn').forEach((btn) => (btn.disabled = false));
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = '';
    input.focus();
});

clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
});

filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

loadTasks();
render();