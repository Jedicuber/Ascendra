const accentColor = document.getElementById("accentColor");
const lightMode = document.getElementById("lightMode");
const dailyQuote = document.getElementById("dailyQuote");
const habitTracker = document.getElementById("habitTracker");
const nightMode = document.getElementById("nightMode");
const taskReminders = document.getElementById("taskReminders");
const eventAlerts = document.getElementById("eventAlerts");

const colors = {
    purple: "rgb(127, 0, 255)",
    blue: "rgb(37, 99, 235)",
    green: "rgb(22, 163, 74)",
    pink: "rgb(219, 39, 119)"
};

function saveSettings() {
    const settings = {
        accentColor: accentColor.value,
        lightMode: lightMode.checked,
        dailyQuote: dailyQuote.checked,
        habitTracker: habitTracker.checked,
        nightMode: nightMode.checked,
        taskReminders: taskReminders.checked,
        eventAlerts: eventAlerts.checked
    };

    localStorage.setItem("ascendraSettings", JSON.stringify(settings));
    applySettings(settings);
}

function loadSettings() {
    const saved = JSON.parse(localStorage.getItem("ascendraSettings"));

    if (saved) {
        accentColor.value = saved.accentColor;
        lightMode.checked = saved.lightMode;
        dailyQuote.checked = saved.dailyQuote;
        habitTracker.checked = saved.habitTracker;
        nightMode.checked = saved.nightMode;
        taskReminders.checked = saved.taskReminders;
        eventAlerts.checked = saved.eventAlerts;

        applySettings(saved);
    } else {
        saveSettings();
    }
}

function applySettings(settings) {
    document.documentElement.style.setProperty("--accent", colors[settings.accentColor]);

    if (settings.lightMode) {
        document.documentElement.style.setProperty("--bg", "#f6f3ff");
        document.documentElement.style.setProperty("--card", "white");
        document.documentElement.style.setProperty("--text", "#222");
        document.documentElement.style.setProperty("--muted", "#666");
    } else {
        document.documentElement.style.setProperty("--bg", "#111827");
        document.documentElement.style.setProperty("--card", "#1f2937");
        document.documentElement.style.setProperty("--text", "#f9fafb");
        document.documentElement.style.setProperty("--muted", "#cbd5e1");
    }
}

function resetSettings() {
    const confirmReset = confirm("Reset Ascendra settings back to default?");

    if (confirmReset) {
        localStorage.removeItem("ascendraSettings");
        location.reload();
    }
}

function deleteAllData() {
    const warning = prompt("Type DELETE to delete all local Ascendra data.");

    if (warning === "DELETE") {
        localStorage.clear();
        alert("All local Ascendra data has been deleted.");
        location.reload();
    } else {
        alert("Delete cancelled.");
    }
}

accentColor.addEventListener("change", saveSettings);
lightMode.addEventListener("change", saveSettings);
dailyQuote.addEventListener("change", saveSettings);
habitTracker.addEventListener("change", saveSettings);
nightMode.addEventListener("change", saveSettings);
taskReminders.addEventListener("change", saveSettings);
eventAlerts.addEventListener("change", saveSettings);

loadSettings();
