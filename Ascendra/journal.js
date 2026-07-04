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

function isTodayDate(day) {
    return day === todayDay && currentMonth === todayMonth && currentYear === todayYear;
}

function isFutureDate(day) {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const realToday = new Date(todayYear, todayMonth, todayDay);
    return selectedDate > realToday;
}

function loadEntry(day) {
    selectedDay = day;

    const entry = JSON.parse(localStorage.getItem(getEntryKey(day)));

    entryTitle.textContent = `Entry for ${monthNames[currentMonth]} ${day}, ${currentYear}`;

    mood.value = entry?.mood || "😄 Happy";
    dayText.value = entry?.day || "";
    gratefulText.value = entry?.grateful || "";
    learnText.value = entry?.learn || "";
    goalText.value = entry?.goal || "";

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

    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.textContent = day;
        button.classList.add("date-button");

        if (localStorage.getItem(getEntryKey(day))) {
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
            button.onclick = () => {
                loadEntry(day);
                buildDateGrid();
            };
        }

        dateGrid.appendChild(button);
    }
}

prevMonth.onclick = () => {
    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    selectedDay = 1;
    buildDateGrid();
    loadEntry(selectedDay);
};

nextMonth.onclick = () => {
    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    selectedDay = 1;
    buildDateGrid();

    if (!isFutureDate(selectedDay)) {
        loadEntry(selectedDay);
    }
};

saveEntry.onclick = () => {
    const entry = {
        mood: mood.value,
        day: dayText.value,
        grateful: gratefulText.value,
        learn: learnText.value,
        goal: goalText.value
    };

    localStorage.setItem(getEntryKey(selectedDay), JSON.stringify(entry));

    statusMessage.textContent = "Entry saved!";
    buildDateGrid();
};

buildDateGrid();
loadEntry(selectedDay);
