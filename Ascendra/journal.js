const today = new Date();

const todayDay = today.getDate();
const todayMonth = today.getMonth();
const todayYear = today.getFullYear();

let currentMonth = todayMonth;
let currentYear = todayYear;
let selectedDay = todayDay;

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const monthTitle = document.getElementById("monthTitle");
const dateGrid = document.getElementById("dateGrid");
const entryTitle = document.getElementById("entryTitle");

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const mood = document.getElementById("mood");
const dayText = document.getElementById("dayText");
const gratefulText = document.getElementById("gratefulText");
const learnText = document.getElementById("learnText");
const goalText = document.getElementById("goalText");

const saveEntry = document.getElementById("saveEntry");
const statusMessage = document.getElementById("statusMessage");

function getEntryKey(day) {
    return `journal-${currentYear}-${currentMonth + 1}-${day}`;
}

function isFutureDate(day) {
    const date = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(todayYear, todayMonth, todayDay);

    return date > todayDate;
}

function isTodayDate(day) {
    return (
        day === todayDay &&
        currentMonth === todayMonth &&
        currentYear === todayYear
    );
}

function loadEntry(day) {
    selectedDay = day;

    const key = getEntryKey(day);
    const entry = JSON.parse(localStorage.getItem(key));

    entryTitle.textContent = `Entry for ${monthNames[currentMonth]} ${day}, ${currentYear}`;

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

    const canEdit = isTodayDate(day);

    mood.disabled = !canEdit;
    dayText.disabled = !canEdit;
    gratefulText.disabled = !canEdit;
    learnText.disabled = !canEdit;
    goalText.disabled = !canEdit;

    saveEntry.style.display = canEdit ? "block" : "none";
    statusMessage.textContent = canEdit ? "" : "Past entries are read-only.";
}

function buildDateGrid() {
    dateGrid.innerHTML = "";
    monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    if (selectedDay > daysInMonth) {
        selectedDay = daysInMonth;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");

        button.textContent = day;
        button.classList.add("date-button");

        const entryExists = localStorage.getItem(getEntryKey(day));

        if (entryExists) {
            button.classList.add("has-entry");
        }

        if (isTodayDate(day)) {
            button.classList.add("today");
        }

        if (day === selectedDay) {
            button.classList.add("selected-day");
        }

        if (isFutureDate(day)) {
            button.classList.add("future");
            button.disabled = true;
        } else {
            button.addEventListener("click", function () {
                loadEntry(day);
                buildDateGrid();
            });
        }

        dateGrid.appendChild(button);
    }
}

prevMonth.onclick = function () {
    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    selectedDay = 1;
    buildDateGrid();
    loadEntry(selectedDay);
};

nextMonth.onclick = function () {
    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    selectedDay = 1;
    buildDateGrid();

    if (isFutureDate(selectedDay)) {
        entryTitle.textContent = `Entry for ${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`;
        mood.disabled = true;
        dayText.disabled = true;
        gratefulText.disabled = true;
        learnText.disabled = true;
        goalText.disabled = true;
        saveEntry.style.display = "none";
        statusMessage.textContent = "Future entries are locked.";
    } else {
        loadEntry(selectedDay);
    }
};

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
    buildDateGrid();
});

buildDateGrid();
loadEntry(selectedDay);
