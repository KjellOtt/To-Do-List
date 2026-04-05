const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const prioritySelect = document.getElementById("priority-select");
const priorityWeights = {"high": 3, "medium": 2, "low": 1};
const sortButton = document.getElementById("sort-button");

let sortAscending = false;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function addTask(){
    if(inputBox.value === ''){
        alert("There has to be SOMETHING to do...");
        return;
    }
    else{
        const newTask = {
            id: Date.now(),
            text: inputBox.value,
            priority: prioritySelect.value,
            checked: false
        };
        tasks.push(newTask);
        inputBox.value = "";
        renderTasks();
    }
}

document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });
});

document.getElementById("add-button").addEventListener("click", addTask);

listContainer.addEventListener("click", function(e) {
    let liElement = e.target.tagName === "LI" ? e.target : e.target.parentElement;
    const clickedId = liElement.dataset.id;
    const task = tasks.find(t => t.id == clickedId);
    if (e.target.tagName === "LI" && e.offsetX < 20) {
        changePriority(task);
        return;
    }
    if (e.target.tagName === "LI") {
        task.checked = !task.checked;
        renderTasks();
    }
    else if (e.target.tagName === "SPAN") {
        tasks = tasks.filter(t => t.id != clickedId);
        renderTasks();
    }
}, false);

function changePriority(task) {
    const priorities = ["low", "medium", "high"];
    const currentIdx = priorities.indexOf(task.priority);
    const nextIdx = (currentIdx + 1) % priorities.length;
    task.priority = priorities[nextIdx];
    renderTasks();
}

function renderTasks() {
    listContainer.innerHTML = "";
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === "open") return !task.checked;
        if (currentFilter === "checked") return task.checked;
        return true;
    });
    filteredTasks.forEach((task) => {
        let li = document.createElement("li");
        li.innerHTML = task.text;
        li.classList.add(`priority-${task.priority}`);
        if (task.checked) {
            li.classList.add("checked");
        } 
        li.dataset.id = task.id;
        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
        listContainer.appendChild(li);
    });
    saveToStorage();
    updateStatus();
}

function saveToStorage(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
renderTasks();

sortButton.addEventListener("click", () => {
    tasks.sort((a, b) => {
        const weightA = priorityWeights[a.priority];
        const weightB = priorityWeights[b.priority];
        if (sortAscending) {
            return weightA - weightB;
        } else {
            return weightB - weightA;
        }
    });
    sortAscending = !sortAscending;
    sortButton.innerText = sortAscending ? "Sort: Low to High" : "Sort: High to Low";
    renderTasks();
});

function updateStatus() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.checked).length;
    const progressText = document.getElementById("progress-text");
    if (totalTasks === 0) {
        progressText.innerText = "Keine Aufgaben vorhanden";
    } else {
        progressText.innerText = `${completedTasks} von ${totalTasks} Aufgaben erledigt`;
    }
    const progressFill = document.getElementById("progress-fill");
    const percentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    progressFill.style.width = percentage + "%";
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker aktiv (toApp)!"))
            .catch(err => console.log("SW Fehler:", err));
    });
}