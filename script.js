const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const prioritySelect = document.getElementById("priority-select");
const sortButton = document.getElementById("sort-button");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let sortAscending = false;

const priorityWeights = { "high": 3, "medium": 2, "low": 1 };

function addTask() {
    if (inputBox.value === '') {
        alert("Du musst etwas eingeben!");
    } else {
        const task = {
            id: Date.now(),
            text: inputBox.value,
            priority: prioritySelect.value,
            checked: false
        };
        tasks.push(task);
        inputBox.value = "";
        saveData();
        renderTasks();
    }
}

document.getElementById("add-button").addEventListener("click", addTask);

listContainer.addEventListener("click", function(e) {
    const li = e.target.tagName === "LI" ? e.target : e.target.parentElement;
    const id = li.dataset.id;
    const task = tasks.find(t => t.id == id);

    if (e.target.tagName === "LI") {
        task.checked = !task.checked;
    } else if (e.target.tagName === "SPAN") {
        tasks = tasks.filter(t => t.id != id);
    }
    saveData();
    renderTasks();
}, false);

function renderTasks() {
    listContainer.innerHTML = "";
    
    let filtered = tasks.filter(t => {
        if (currentFilter === "open") return !t.checked;
        if (currentFilter === "checked") return t.checked;
        return true;
    });

    filtered.forEach(task => {
        let li = document.createElement("li");
        li.innerHTML = task.text;
        li.dataset.id = task.id;
        li.classList.add(`priority-${task.priority}`);
        if (task.checked) li.classList.add("checked");

        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
        listContainer.appendChild(li);
    });
    updateStatus();
}

document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });
});

sortButton.addEventListener("click", () => {
    tasks.sort((a, b) => {
        return sortAscending ? 
            priorityWeights[b.priority] - priorityWeights[a.priority] : 
            priorityWeights[a.priority] - priorityWeights[b.priority];
    });
    sortAscending = !sortAscending;
    sortButton.innerText = sortAscending ? "Sort: Low to High" : "Sort: High to Low";
    renderTasks();
});

function updateStatus() {
    const total = tasks.length;
    const done = tasks.filter(t => t.checked).length;
    document.getElementById("progress-text").innerText = `${done} / ${total} Tasks completed`;
    const percent = total === 0 ? 0 : (done / total) * 100;
    document.getElementById("progress-fill").style.width = percent + "%";
}

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

renderTasks();