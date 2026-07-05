function goTo(page) {
    window.location.href = page;
}

// ===========================
// Greeting
// ===========================

const greeting = document.getElementById("greeting");
const dateText = document.getElementById("dateText");

const now = new Date();
const hour = now.getHours();

const firstName = localStorage.getItem("name") || "";
const lastName = localStorage.getItem("surname") || "";
const fullName = `${firstName} ${lastName}`.trim();

let greetingText = "";
let emoji = "";

if (hour >= 5 && hour < 12) {
    greetingText = "Good morning";
    emoji = "☀️";
} else if (hour >= 12 && hour < 17) {
    greetingText = "Good afternoon";
    emoji = "🌤️";
} else if (hour >= 17 && hour < 21) {
    greetingText = "Good evening";
    emoji = "🌅";
} else {
    greetingText = "Good night";
    emoji = "🌙";
}

if (greeting) {
    if (fullName !== "") {
        greeting.textContent = `${greetingText}, ${fullName}! ${emoji}`;
    } else {
        greeting.textContent = `${greetingText}! ${emoji}`;
    }
}

if (dateText) {
    dateText.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

// ===========================
// Load Data
// ===========================

const todayKey = now.toISOString().split("T")[0];

const todos = JSON.parse(localStorage.getItem("todos")) || [];
const events = JSON.parse(localStorage.getItem("events")) || [];
const habits = JSON.parse(localStorage.getItem("habits")) || [];

// ===========================
// Elements
// ===========================

const todoList = document.getElementById("todoList");
const calendarList = document.getElementById("calendarList");
const habitList = document.getElementById("habitList");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

// ===========================
// To-Dos
// ===========================

if (todoList) {

    todoList.innerHTML = "";

    if (todos.length === 0) {
        todoList.innerHTML = "<li>No to-dos yet</li>";
    } else {

        todos.slice(0, 5).forEach(todo => {

            const li = document.createElement("li");
            li.textContent = todo.task;

            todoList.appendChild(li);

        });

    }

}

// ===========================
// Calendar
// ===========================

if (calendarList) {

    calendarList.innerHTML = "";

    const nextEvents = events
        .filter(event => event.date >= todayKey)
        .sort((a, b) => {

            const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
            const dateB = new Date(`${b.date}T${b.time || "00:00"}`);

            return dateA - dateB;

        })
        .slice(0, 3);

    if (nextEvents.length === 0) {

        calendarList.innerHTML = "<li>No upcoming events</li>";

    } else {

        nextEvents.forEach(event => {

            const li = document.createElement("li");

            li.textContent =
                `${event.date} ${event.time || ""} - ${event.title || event.name || "Event"}`;

            calendarList.appendChild(li);

        });

    }

}

// ===========================
// Habits
// ===========================

if (habitList) {

    habitList.innerHTML = "";

    if (habits.length === 0) {

        habitList.innerHTML = "<li>No habits yet</li>";

    } else {

        habits.slice(0, 5).forEach(habit => {

            const li = document.createElement("li");

            li.textContent =
                `${habit.type === "bad" ? "⚠️" : "✅"} ${habit.name}`;

            habitList.appendChild(li);

        });

    }

}

// ===========================
// Progress
// ===========================

let totalItems = todos.length + habits.length;
let completedItems = 0;

todos.forEach(todo => {
    if (todo.completed) completedItems++;
});

habits.forEach(habit => {
    if (habit.completed) completedItems++;
});

const progress = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

if (progressFill && progressText) {
    progressFill.style.width = progress + "%";
    progressText.textContent = progress + "% complete";
}

// ===========================
// Shooting Star
// ===========================

const starContainer = document.getElementById("shootingStars");

function createStar(){

    if(!starContainer) return;

    const star = document.createElement("div");
    star.className = "star";

    // Start on the RIGHT side of the hero
    star.style.left = (starContainer.offsetWidth - 30) + "px";

    // Random height near the top
    star.style.top = (Math.random() * 80 + 20) + "px";

    starContainer.appendChild(star);

    star.addEventListener("animationend", () => {
        star.remove();
    });

}

// Random every 3–7 seconds
createStar();

setInterval(() => {

    createStar();

}, Math.random() * 4000 + 3000);
