const today = new Date();

const currentDay = today.getDate();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const monthTitle = document.getElementById("monthTitle");
const dateGrid = document.getElementById("dateGrid");
const entryTitle = document.getElementById("entryTitle");

const mood = document.getElementById("mood");
const dayText = document.getElementById("dayText");
const gratefulText = document.getElementById("gratefulText");
const learnText = document.getElementById("learnText");
const goalText = document.getElementById("goalText");

const saveEntry = document.getElementById("saveEntry");
const statusMessage = document.getElementById("statusMessage");

let selectedDay = currentDay;

monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

function getEntryKey(day) {
    return `journal-${currentYear}-${currentMonth + 1}-${day}`;
}

function loadEntry(day) {
    selectedDay = day;

    const key = getEntryKey(day);
    const entry = JSON.parse(localStorage.getItem(key));

    entryTitle.textContent = `Entry for ${monthNames[currentMonth]} ${day}`;

    if (entry) {
        mood.value = entry.mood;
        dayText.value = entry.day;
        gratefulText.value = entry.grateful;
        learnText.value = entry.learn;
        goalText.value = entry.goal;
    } else {
        mood.value = "😄 Happy";
        dayText.value = "";
        gratefulText.value = "";
        learnText.value = "";
        goalText.value = "";
    }

    const isToday = day === currentDay;

    mood.disabled = !isToday;
    dayText.disabled = !isToday;
    gratefulText.disabled = !isToday;
    learnText.disabled = !isToday;
    goalText.disabled = !isToday;
    saveEntry.style.display = isToday ? "block" : "none";

    statusMessage.textContent = isToday ? "" : "Past entries are read-only.";
}

function buildDateGrid() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.textContent = day;
        button.classList.add("date-button");

        const entryExists = localStorage.getItem(getEntryKey(day));

        if (entryExists) {
            button.classList.add("has-entry");
        }

        if (day === currentDay) {
            button.classList.add("today");
        }

        if (day > currentDay) {
            button.classList.add("future");
            button.disabled = true;
        } else {
            button.addEventListener("click", function () {
                loadEntry(day);
            });
        }

        dateGrid.appendChild(button);
    }
}

saveEntry.addEventListener("click", function () {
    const key = getEntryKey(selectedDay);

    const entry = {
        mood: mood.value,
        day: dayText.value,
        grateful: gratefulText.value,
        learn: learnText.value,
        goal: goalText.value
    };

    localStorage.setItem(key, JSON.stringify(entry));

    statusMessage.textContent = "Entry saved!";
    dateGrid.innerHTML = "";
    buildDateGrid();
});

buildDateGrid();
loadEntry(currentDay);const today = new Date();

const currentDay = today.getDate();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const monthTitle = document.getElementById("monthTitle");
const dateGrid = document.getElementById("dateGrid");
const entryTitle = document.getElementById("entryTitle");

const mood = document.getElementById("mood");
const dayText = document.getElementById("dayText");
const gratefulText = document.getElementById("gratefulText");
const learnText = document.getElementById("learnText");
const goalText = document.getElementById("goalText");

const saveEntry = document.getElementById("saveEntry");
const statusMessage = document.getElementById("statusMessage");

let selectedDay = currentDay;

monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

function getEntryKey(day) {
    return `journal-${currentYear}-${currentMonth + 1}-${day}`;
}

function loadEntry(day) {
    selectedDay = day;

    const key = getEntryKey(day);
    const entry = JSON.parse(localStorage.getItem(key));

    entryTitle.textContent = `Entry for ${monthNames[currentMonth]} ${day}`;

    if (entry) {
        mood.value = entry.mood;
        dayText.value = entry.day;
        gratefulText.value = entry.grateful;
        learnText.value = entry.learn;
        goalText.value = entry.goal;
    } else {
        mood.value = "😄 Happy";
        dayText.value = "";
        gratefulText.value = "";
        learnText.value = "";
        goalText.value = "";
    }

    const isToday = day === currentDay;

    mood.disabled = !isToday;
    dayText.disabled = !isToday;
    gratefulText.disabled = !isToday;
    learnText.disabled = !isToday;
    goalText.disabled = !isToday;
    saveEntry.style.display = isToday ? "block" : "none";

    statusMessage.textContent = isToday ? "" : "Past entries are read-only.";
}

function buildDateGrid() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.textContent = day;
        button.classList.add("date-button");

        const entryExists = localStorage.getItem(getEntryKey(day));

        if (entryExists) {
            button.classList.add("has-entry");
        }

        if (day === currentDay) {
            button.classList.add("today");
        }

        if (day > currentDay) {
            button.classList.add("future");
            button.disabled = true;
        } else {
            button.addEventListener("click", function () {
                loadEntry(day);
            });
        }

        dateGrid.appendChild(button);
    }
}

saveEntry.addEventListener("click", function () {
    const key = getEntryKey(selectedDay);

    const entry = {
        mood: mood.value,
        day: dayText.value,
        grateful: gratefulText.value,
        learn: learnText.value,
        goal: goalText.value
    };

    localStorage.setItem(key, JSON.stringify(entry));

    statusMessage.textContent = "Entry saved!";
    dateGrid.innerHTML = "";
    buildDateGrid();
});

buildDateGrid();
loadEntry(currentDay);