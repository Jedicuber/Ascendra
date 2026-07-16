
"use strict";
const app = document.getElementById("app");
const backButton = document.getElementById("spaBackButton");
const initializedCleanups = new Map();

function normalizeRoute(value) {
    let route = String(value || "welcome").replace(/^#\/?/, "").replace(/\.html$/, "");
    if (route === "index" || route === "") route = "welcome";
    if (route === "alert") route = "alerts";
    if (route === "projects") route = "comingsoon";
    return document.getElementById("page-" + route) ? route : "welcome";
}
function getRoute(){ return normalizeRoute(location.hash); }
function navigate(route, replace=false){
    route=normalizeRoute(route);
    const hash="#/"+route;
    if(replace) history.replaceState({route},"",hash);
    else if(location.hash!==hash) history.pushState({route},"",hash);
    renderRoute(route);
}
function goBack(){
    if(history.length>1){ history.back(); }
    else { navigate(getRoute()==="login"||getRoute()==="signup"?"welcome":"home",true); }
}
window.navigate=navigate;
window.goTo=function(page){ navigate(page); };
window.goBack=goBack;

function applySavedSettings(){
    const colors={purple:"rgb(127, 0, 255)",blue:"rgb(37, 99, 235)",green:"rgb(22, 163, 74)",pink:"rgb(219, 39, 119)"};
    let s=null; try{s=JSON.parse(localStorage.getItem("ascendraSettings"));}catch(e){}
    s=s||{accentColor:"purple",lightMode:true};
    document.documentElement.style.setProperty("--accent",colors[s.accentColor]||colors.purple);
    document.documentElement.style.setProperty("--bg",s.lightMode===false?"#111827":"#f6f3ff");
    document.documentElement.style.setProperty("--card",s.lightMode===false?"#1f2937":"white");
    document.documentElement.style.setProperty("--text",s.lightMode===false?"#f9fafb":"#222");
    document.documentElement.style.setProperty("--muted",s.lightMode===false?"#cbd5e1":"#666");
}

function renderRoute(route){
    route=normalizeRoute(route);
    const template=document.getElementById("page-"+route);
    if(!template){ app.innerHTML='<div class="spa-error"><h1>Page not found</h1></div>'; return; }
    // stop route-owned intervals/animations when possible by replacing the DOM and calling cleanup
    const old=app.dataset.route;
    if(old && initializedCleanups.has(old)){
        try{ initializedCleanups.get(old)(); }catch(e){ console.warn(e); }
        initializedCleanups.delete(old);
    }
    app.innerHTML='';
    const page=document.createElement('section');
    page.className='ascendra-page';
    page.dataset.route=route;
    page.appendChild(template.content.cloneNode(true));
    app.appendChild(page);
    app.dataset.route=route;
    document.title='Ascendra - '+route.replace(/-/g,' ').replace(/\w/g,c=>c.toUpperCase());
    backButton.hidden=(route==='welcome');
    applySavedSettings();
    try{
        const cleanup=(ROUTE_INITIALIZERS[route]||function(){})();
        if(typeof cleanup==='function') initializedCleanups.set(route,cleanup);
    }catch(error){
        console.error('Ascendra page error on '+route+':',error);
        const box=document.createElement('div'); box.className='spa-error';
        box.innerHTML='<h2>This page hit an error</h2><p>Open DevTools Console for the exact line.</p>';
        page.prepend(box);
    }
    window.scrollTo(0,0);
}
window.addEventListener('popstate',()=>renderRoute(getRoute()));
window.addEventListener('hashchange',()=>renderRoute(getRoute()));
document.addEventListener('click',function(e){
    const a=e.target.closest('a[href^="#/"]');
    if(a){e.preventDefault();navigate(a.getAttribute('href'));}
});

const ROUTE_INITIALIZERS = {
"welcome": function init_welcome(){


},
"loading-screen": function init_loading_screen(){
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let backgroundStars = [];

// Resize canvas and create stars
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    backgroundStars = [];

    // Create random stars
    for (let i = 0; i < 75; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 1,
            color: Math.random() < 0.85
                ? "white"
                : "rgb(242,241,153)"
        });
    }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Shooting star variables
let xPos = 300;
let yPos = 100;
let starSize = 8;
let starEdge = 12;

// Draw a circle
function circle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw random stars
    for (const star of backgroundStars) {
        circle(star.x, star.y, star.size, star.color);
    }

    // Center the shooting star
    ctx.save();

    const offsetX = (canvas.width - 400) / 2;
    const offsetY = (canvas.height - 400) / 2;
    ctx.translate(offsetX, offsetY);

    // Red glow
    circle(xPos, yPos, starEdge, "red");

    // Shooting star
    ctx.lineWidth = 5;
    ctx.strokeStyle = "orange";
    ctx.fillStyle = "yellow";

    ctx.beginPath();
    ctx.arc(xPos, yPos, starSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

// Animate
xPos -= 3;
yPos += 3;
starSize += 0.7;
starEdge += 0.7;

// Restart when it leaves the screen
if (xPos < -150 || yPos > 550) {
    xPos = 500;
    yPos = -50;

    starSize = 8;
    starEdge = 12;
}

    requestAnimationFrame(draw);
}

draw();
window.circle = circle;
window.draw = draw;
window.resizeCanvas = resizeCanvas;
},
"login": function init_login(){
const loginForm = document.getElementById("login");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const savedUser = JSON.parse(localStorage.getItem(username));

    if (savedUser && savedUser.password === password) {
        localStorage.setItem("name", savedUser.name || "");
        localStorage.setItem("surname", savedUser.surname || "");
        localStorage.setItem("username", savedUser.username || username);
        localStorage.setItem("password", savedUser.password || "");
        localStorage.setItem("loggedInUser", savedUser.username || username);
        alert("Welcome back, " + savedUser.name + "!");
            navigate('home');
    } else {
        alert("Wrong username or password!");
    }

    loginForm.reset();
});

},
"signup": function init_signup(){
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

   const name = document.getElementById("name").value.trim();
const surname = document.getElementById("surname").value.trim();
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value;

localStorage.setItem("name", name);
localStorage.setItem("surname", surname);
localStorage.setItem("username", username);
localStorage.setItem("password", password);
    const user = {
        name: name,
        surname: surname,
        username: username,
        password: password
    };

    localStorage.setItem(username, JSON.stringify(user));

    alert("Account created!");

    navigate('home');

    signupForm.reset();
});

},
"home": function init_home(){
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

window.createStar = createStar;
window.goTo = goTo;
},
"alerts": function init_alerts(){
const alertList = document.getElementById("alertList");

const todos = JSON.parse(localStorage.getItem("todos")) || [];

alertList.innerHTML = "";

if (todos.length === 0) {

    alertList.innerHTML = "<p>No alerts 🎉</p>";

} else {

    // Sort by due date
    todos.sort((a, b) => new Date(a.date) - new Date(b.date));

    todos.forEach(todo => {

        const card = document.createElement("div");
        card.classList.add("alert-card");

        const dueDate = new Date(todo.date);
        const today = new Date();

        // Remove the time part so the comparison is by date only
        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const daysLeft = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

        let status = "";

        if (daysLeft < 0) {
            status = "🔴 Overdue";
        } else if (daysLeft === 0) {
            status = "🟠 Due Today";
        } else if (daysLeft === 1) {
            status = "🟡 Due Tomorrow";
        } else {
            status = `🟢 Due in ${daysLeft} days`;
        }

        card.innerHTML = `
            <h3>${todo.task}</h3>
            <p>📅 ${todo.date}</p>
            <p>${status}</p>
        `;

        alertList.appendChild(card);

    });

}

},
"todos": function init_todos(){

    const addBtn = document.getElementById("add-btn");
    const popup = document.getElementById("popup");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    const taskInput = document.getElementById("task-input");
    const dateInput = document.getElementById("date-input");
    const todoList = document.getElementById("todo-list");

    let todos = JSON.parse(localStorage.getItem("todos")) || [];

    function saveTodos() {
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    function showTodos() {
        todoList.innerHTML = "";

        if (todos.length === 0) {
            todoList.innerHTML = "<p>No tasks yet</p>";
            return;
        }

        todos.forEach(todo => {
            const card = document.createElement("div");
            card.classList.add("todo-card");

            if (todo.completed) {
                card.classList.add("completed");
            }

            card.innerHTML = `
                <div class="todo-info">
                    <div class="todo-title">
                        ${todo.completed ? "✅" : "⬜"} ${todo.task}
                    </div>
                    <div class="todo-date">Due: ${todo.date}</div>
                </div>

                <button class="complete-btn">
                    ${todo.completed ? "Undo" : "Done"}
                </button>

                <button class="delete-btn">🗑️</button>
            `;

            const completeBtn = card.querySelector(".complete-btn");
            const deleteBtn = card.querySelector(".delete-btn");

            completeBtn.onclick = () => {
                todo.completed = !todo.completed;
                saveTodos();
                showTodos();
            };

            deleteBtn.onclick = () => {
                todos = todos.filter(t => t.id !== todo.id);
                saveTodos();
                showTodos();
            };

            todoList.appendChild(card);
        });
    }

    addBtn.onclick = () => {
        popup.style.display = "block";
        taskInput.focus();
    };

    cancelBtn.onclick = () => {
        popup.style.display = "none";
        taskInput.value = "";
        dateInput.value = "";
    };

    saveBtn.onclick = () => {
        const task = taskInput.value.trim();
        const date = dateInput.value;

        if (task === "" || date === "") {
            alert("Add a task and due date first!");
            return;
        }

        todos.push({
            id: Date.now(),
            task: task,
            date: date,
            completed: false
        });

        saveTodos();
        showTodos();

        popup.style.display = "none";
        taskInput.value = "";
        dateInput.value = "";
    };

    showTodos();

window.saveTodos = saveTodos;
window.showTodos = showTodos;
},
"habits": function init_habits(){

const addHabitBtn = document.getElementById("addHabitBtn");
const habitPopup = document.getElementById("habitPopup");
const saveHabitBtn = document.getElementById("saveHabitBtn");
const cancelHabitBtn = document.getElementById("cancelHabitBtn");

const habitInput = document.getElementById("habitInput");
const habitType = document.getElementById("habitType");
const habitList = document.getElementById("habitList");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function saveHabitResult(habit, result) {
    const today = getToday();

    if (!habit.history) {
        habit.history = {};
    }

    habit.history[today] = result;

    saveHabits();
}

function getHabitResultText(habit) {
    const today = getToday();

    if (!habit.history) {
        return "Not checked today";
    }

    const result = habit.history[today];

    if (result === true) {
        if (habit.type === "bad") {
            return "Avoided today ✅";
        }

        return "Completed today ✅";
    }

    if (result === false) {
        if (habit.type === "bad") {
            return "Habit happened today ❌";
        }

        return "Missed today ❌";
    }

    return "Not checked today";
}

function showHabits() {
    habitList.innerHTML = "";

    if (habits.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No habits yet";
        habitList.appendChild(emptyMessage);
        return;
    }

    habits.forEach(function (habit) {
        const habitCard = document.createElement("div");
        habitCard.classList.add("habit");

        const leftSide = document.createElement("div");
        leftSide.classList.add("left");

        const habitTitle = document.createElement("div");
        habitTitle.classList.add("habit-title");
        habitTitle.textContent = habit.name;

        const habitTypeText = document.createElement("div");
        habitTypeText.classList.add("habit-type");

        if (habit.type === "bad") {
            habitTypeText.textContent = "Bad habit";
        } else {
            habitTypeText.textContent = "Good habit";
        }

        const habitResult = document.createElement("div");
        habitResult.classList.add("habit-result");
        habitResult.textContent = getHabitResultText(habit);

        leftSide.appendChild(habitTitle);
        leftSide.appendChild(habitTypeText);
        leftSide.appendChild(habitResult);

        const rightSide = document.createElement("div");
        rightSide.classList.add("right");

        const checkButton = document.createElement("button");
        checkButton.classList.add("check-btn");
        checkButton.textContent = "✅";

        const xButton = document.createElement("button");
        xButton.classList.add("x-btn");
        xButton.textContent = "❌";

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.textContent = "🗑️";

        checkButton.onclick = function () {
            saveHabitResult(habit, true);

            if (habit.type === "bad") {
                alert("Nice! You avoided the bad habit ✅");
            } else {
                alert("Nice! You did the good habit ✅");
            }

            showHabits();
        };

        xButton.onclick = function () {
            saveHabitResult(habit, false);

            if (habit.type === "bad") {
                alert("You did the bad habit today ❌");
            } else {
                alert("You missed the good habit today ❌");
            }

            showHabits();
        };

        deleteButton.onclick = function () {
            habits = habits.filter(function (savedHabit) {
                return savedHabit.id !== habit.id;
            });

            saveHabits();
            showHabits();
        };

        rightSide.appendChild(checkButton);
        rightSide.appendChild(xButton);
        rightSide.appendChild(deleteButton);

        habitCard.appendChild(leftSide);
        habitCard.appendChild(rightSide);

        habitList.appendChild(habitCard);
    });
}

addHabitBtn.onclick = function () {
    habitPopup.style.display = "block";
    habitInput.focus();
};

cancelHabitBtn.onclick = function () {
    habitPopup.style.display = "none";
    habitInput.value = "";
};

saveHabitBtn.onclick = function () {
    const name = habitInput.value.trim();

    if (name === "") {
        alert("Add a habit name first!");
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        type: habitType.value,
        history: {}
    };

    habits.push(newHabit);

    saveHabits();
    showHabits();

    habitPopup.style.display = "none";
    habitInput.value = "";
};

showHabits();


window.getHabitResultText = getHabitResultText;
window.getToday = getToday;
window.saveHabitResult = saveHabitResult;
window.saveHabits = saveHabits;
window.showHabits = showHabits;
},
"breathing": function init_breathing(){
const exercises = {
    box: {
        title: "Box Breathing",
        instructions: "Breathe in for 4, hold for 4, exhale for 4, hold for 4.",
        phases: [
            { text: "Breathe In", time: 4, scale: 1.4 },
            { text: "Hold", time: 4, scale: 1.4 },
            { text: "Exhale", time: 4, scale: 1 },
            { text: "Hold", time: 4, scale: 1 }
        ]
    },

    calm: {
        title: "Calm Breathing",
        instructions: "Breathe in for 5 seconds, then exhale for 5 seconds.",
        phases: [
            { text: "Breathe In", time: 5, scale: 1.4 },
            { text: "Exhale", time: 5, scale: 1 }
        ]
    },

    relax: {
        title: "4-7-8 Breathing",
        instructions: "Breathe in for 4, hold for 7, exhale for 8.",
        phases: [
            { text: "Breathe In", time: 4, scale: 1.4 },
            { text: "Hold", time: 7, scale: 1.4 },
            { text: "Exhale", time: 8, scale: 1 }
        ]
    }
};

let currentExercise = exercises.box;
let phaseIndex = 0;
let countdown = 0;
let timer = null;

const exerciseTitle = document.getElementById("exerciseTitle");
const instructions = document.getElementById("instructions");
const circle = document.getElementById("circle");
const phaseText = document.getElementById("phaseText");
const countdownText = document.getElementById("countdown");

function chooseExercise(type) {
    stopBreathing();

    currentExercise = exercises[type];

    exerciseTitle.textContent = currentExercise.title;
    instructions.textContent = currentExercise.instructions;
    phaseText.textContent = "Ready";
    countdownText.textContent = "0";
    circle.style.transform = "scale(1)";
}

function startBreathing() {
    stopBreathing();

    phaseIndex = 0;
    runPhase();
}

function runPhase() {
    const phase = currentExercise.phases[phaseIndex];

    countdown = phase.time;

    phaseText.textContent = phase.text;
    countdownText.textContent = countdown;
    circle.style.transform = `scale(${phase.scale})`;

    timer = setInterval(() => {
        countdown--;
        countdownText.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timer);

            phaseIndex++;

            if (phaseIndex >= currentExercise.phases.length) {
                phaseIndex = 0;
            }

            runPhase();
        }
    }, 1000);
}

function stopBreathing() {
    clearInterval(timer);
    timer = null;

    phaseIndex = 0;
    phaseText.textContent = "Ready";
    countdownText.textContent = "0";
    circle.style.transform = "scale(1)";
}
window.chooseExercise = chooseExercise;
window.runPhase = runPhase;
window.startBreathing = startBreathing;
window.stopBreathing = stopBreathing;
return function(){ try{ stopBreathing(); }catch(e){} };
},
"calendar": function init_calendar(){
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const calendarTitle = document.querySelector(".calendar-header h2");
const calendarBody = document.getElementById("calendarBody");

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const addEventBtn = document.querySelector(".addEvent");
const popup = document.getElementById("eventPopup");
const closePopup = document.getElementById("closePopup");
const saveEvent = document.getElementById("saveEvent");

const eventTitleInput = document.getElementById("eventTitle");
const eventDateInput = document.getElementById("eventDate");

let events = JSON.parse(localStorage.getItem("events")) || [];

flatpickr("#eventDate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    altInput: true,
    altFormat: "F j, Y h:i K",
    minDate: "today"
});

function renderCalendar() {
    calendarBody.innerHTML = "";
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let date = 1;

    for (let row = 0; row < 6; row++) {
        const tr = document.createElement("tr");

        for (let col = 0; col < 7; col++) {
            const td = document.createElement("td");

            if (row === 0 && col < firstDay) {
                td.classList.add("empty-day");
            } else if (date > daysInMonth) {
                td.classList.add("empty-day");
            } else {
                td.textContent = date;

                if (
                    date === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear()
                ) {
                    td.classList.add("today");
                }

                showEventsForDay(td, date);
                date++;
            }

            tr.appendChild(td);
        }

        calendarBody.appendChild(tr);
    }
}

function showEventsForDay(dayCell, dayNumber) {
    events.forEach(event => {
        const eventDate = new Date(event.date);

        if (
            eventDate.getDate() === dayNumber &&
            eventDate.getMonth() === currentMonth &&
            eventDate.getFullYear() === currentYear
        ) {
            const eventText = document.createElement("div");
            eventText.classList.add("calendar-event");
            eventText.textContent = event.title;

            eventText.onclick = () => {
                if (confirm(`Delete "${event.title}"?`)) {
                    events = events.filter(e => e.id !== event.id);
                    localStorage.setItem("events", JSON.stringify(events));
                    renderCalendar();
                }
            };

            dayCell.appendChild(eventText);
        }
    });
}

prevMonth.onclick = () => {
    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    renderCalendar();
};

nextMonth.onclick = () => {
    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    renderCalendar();
};

addEventBtn.onclick = () => {
    popup.style.display = "block";
};

closePopup.onclick = () => {
    popup.style.display = "none";
};

saveEvent.onclick = () => {
    const title = eventTitleInput.value.trim();
    const dateValue = eventDateInput.value;

    if (title === "" || dateValue === "") {
        alert("Add an event name and date first!");
        return;
    }

    events.push({
        id: Date.now(),
        title: title,
        date: dateValue
    });

    localStorage.setItem("events", JSON.stringify(events));

    eventTitleInput.value = "";
    eventDateInput.value = "";
    popup.style.display = "none";

    renderCalendar();
};

renderCalendar();
window.renderCalendar = renderCalendar;
window.showEventsForDay = showEventsForDay;
},
"journal": function init_journal(){
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

window.buildDateGrid = buildDateGrid;
window.getEntryKey = getEntryKey;
window.isFutureDate = isFutureDate;
window.isTodayDate = isTodayDate;
window.loadEntry = loadEntry;
},
"menu": function init_menu(){
function goTo(page) {
    window.location.href = page;
}

const buttons = document.querySelectorAll("#nav button");

const radius = 240;
let angle = 0;
let paused = false;

// Pause rotation while hovering over a button
buttons.forEach(button => {

    button.addEventListener("mouseenter", () => {
        paused = true;
    });

    button.addEventListener("mouseleave", () => {
        paused = false;
    });

});

function animate() {

    if (!paused) {
        angle += 0.0015; // Rotation speed
    }

    buttons.forEach((button, i) => {

        const currentAngle = angle + i * (Math.PI * 2 / buttons.length);

        const x = Math.cos(currentAngle) * radius;
        const y = Math.sin(currentAngle) * radius;

        button.style.left = `${x}px`;
        button.style.top = `${y}px`;

        // Keep the button upright
        button.style.transform = "translate(-50%, -50%)";

    });

    requestAnimationFrame(animate);

}

animate();
window.animate = animate;
window.goTo = goTo;
},
"settings": function init_settings(){
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
        renderRoute(getRoute());
    }
}

function deleteAllData() {
    const warning = prompt("Type DELETE to delete all local Ascendra data.");

    if (warning === "DELETE") {
        localStorage.clear();
        alert("All local Ascendra data has been deleted.");
        renderRoute(getRoute());
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
window.applySettings = applySettings;
window.deleteAllData = deleteAllData;
window.loadSettings = loadSettings;
window.resetSettings = resetSettings;
window.saveSettings = saveSettings;
},
"stats": function init_stats(){

    const totalTasksElement =
        document.getElementById("total-tasks");

    const completedTasksElement =
        document.getElementById("completed-tasks");

    const remainingTasksElement =
        document.getElementById("remaining-tasks");

    const taskCompletionRateElement =
        document.getElementById("task-completion-rate");

    const taskProgressLabel =
        document.getElementById("task-progress-label");

    const taskProgressFill =
        document.getElementById("task-progress-fill");

    const taskProgressMessage =
        document.getElementById("task-progress-message");

    const totalHabitsElement =
        document.getElementById("total-habits");

    const successfulHabitDaysElement =
        document.getElementById("successful-habit-days");

    const missedHabitDaysElement =
        document.getElementById("missed-habit-days");

    const habitSuccessRateElement =
        document.getElementById("habit-success-rate");

    const habitProgressLabel =
        document.getElementById("habit-progress-label");

    const habitProgressFill =
        document.getElementById("habit-progress-fill");

    const habitProgressMessage =
        document.getElementById("habit-progress-message");

    const dueTodayElement =
        document.getElementById("due-today");

    const overdueTasksElement =
        document.getElementById("overdue-tasks");

    const futureTasksElement =
        document.getElementById("future-tasks");

    const habitsSuccessfulTodayElement =
        document.getElementById("habits-successful-today");

    const habitsMissedTodayElement =
        document.getElementById("habits-missed-today");

    const habitsUncheckedTodayElement =
        document.getElementById("habits-unchecked-today");

    const achievementIcon =
        document.getElementById("achievement-icon");

    const achievementTitle =
        document.getElementById("achievement-title");

    const achievementDescription =
        document.getElementById("achievement-description");

    const recentTasksContainer =
        document.getElementById("recent-tasks");

    const welcomeMessage =
        document.getElementById("welcome-message");

    function getStoredArray(key) {
        const savedData = localStorage.getItem(key);

        if (!savedData) {
            return [];
        }

        try {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                return parsedData;
            }

            return [];
        } catch (error) {
            console.error(
                "Could not read " + key + ":",
                error
            );

            return [];
        }
    }

    function getTodayString() {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    function updateWelcomeMessage() {
        const name = localStorage.getItem("name");

        if (name) {
            welcomeMessage.textContent =
                "Keep building momentum, " + name + ".";
        }
    }

    function updateTaskStatistics(todos) {
        const totalTasks = todos.length;
        let completedTasks = 0;

        todos.forEach(function (todo) {
            if (todo.completed === true) {
                completedTasks++;
            }
        });

        const remainingTasks =
            totalTasks - completedTasks;

        let completionRate = 0;

        if (totalTasks > 0) {
            completionRate = Math.round(
                completedTasks / totalTasks * 100
            );
        }

        totalTasksElement.textContent =
            totalTasks;

        completedTasksElement.textContent =
            completedTasks;

        remainingTasksElement.textContent =
            remainingTasks;

        taskCompletionRateElement.textContent =
            completionRate + "%";

        taskProgressLabel.textContent =
            completionRate + "%";

        taskProgressFill.style.width =
            completionRate + "%";

        updateTaskProgressMessage(
            totalTasks,
            completedTasks,
            completionRate
        );

        return completedTasks;
    }

    function updateTaskProgressMessage(
        totalTasks,
        completedTasks,
        completionRate
    ) {
        if (totalTasks === 0) {
            taskProgressMessage.textContent =
                "Add your first task to begin tracking progress.";
        } else if (completionRate === 100) {
            taskProgressMessage.textContent =
                "Every task is complete. Absolute productivity monster.";
        } else if (completionRate >= 75) {
            taskProgressMessage.textContent =
                "You are nearly there. Finish strong.";
        } else if (completionRate >= 50) {
            taskProgressMessage.textContent =
                "More than halfway complete. Nice work.";
        } else if (completedTasks > 0) {
            taskProgressMessage.textContent =
                "Progress is progress. Keep stacking wins.";
        } else {
            taskProgressMessage.textContent =
                "Your tasks are ready when you are.";
        }
    }

    function updateTaskDateStatistics(todos) {
        const today = getTodayString();

        let dueToday = 0;
        let overdueTasks = 0;
        let futureTasks = 0;

        todos.forEach(function (todo) {
            if (todo.completed === true) {
                return;
            }

            if (todo.date === today) {
                dueToday++;
            } else if (todo.date && todo.date < today) {
                overdueTasks++;
            } else if (todo.date && todo.date > today) {
                futureTasks++;
            }
        });

        dueTodayElement.textContent =
            dueToday;

        overdueTasksElement.textContent =
            overdueTasks;

        futureTasksElement.textContent =
            futureTasks;
    }

    function updateHabitStatistics(habits) {
        let successfulHabitDays = 0;
        let missedHabitDays = 0;

        habits.forEach(function (habit) {
            if (!habit.history) {
                return;
            }

            const historyDates =
                Object.keys(habit.history);

            historyDates.forEach(function (date) {
                const result = habit.history[date];

                if (result === true) {
                    successfulHabitDays++;
                } else if (result === false) {
                    missedHabitDays++;
                }
            });
        });

        const totalCheckIns =
            successfulHabitDays + missedHabitDays;

        let habitSuccessRate = 0;

        if (totalCheckIns > 0) {
            habitSuccessRate = Math.round(
                successfulHabitDays /
                totalCheckIns *
                100
            );
        }

        totalHabitsElement.textContent =
            habits.length;

        successfulHabitDaysElement.textContent =
            successfulHabitDays;

        missedHabitDaysElement.textContent =
            missedHabitDays;

        habitSuccessRateElement.textContent =
            habitSuccessRate + "%";

        habitProgressLabel.textContent =
            habitSuccessRate + "%";

        habitProgressFill.style.width =
            habitSuccessRate + "%";

        updateHabitProgressMessage(
            habits.length,
            totalCheckIns,
            habitSuccessRate
        );

        return successfulHabitDays;
    }

    function updateHabitProgressMessage(
        totalHabits,
        totalCheckIns,
        habitSuccessRate
    ) {
        if (totalHabits === 0) {
            habitProgressMessage.textContent =
                "Add your first habit to begin tracking progress.";
        } else if (totalCheckIns === 0) {
            habitProgressMessage.textContent =
                "Check off a habit to begin tracking it.";
        } else if (habitSuccessRate === 100) {
            habitProgressMessage.textContent =
                "Perfect habit record so far. Huge win.";
        } else if (habitSuccessRate >= 75) {
            habitProgressMessage.textContent =
                "Your habits are looking strong.";
        } else if (habitSuccessRate >= 50) {
            habitProgressMessage.textContent =
                "You are building consistency. Keep going.";
        } else {
            habitProgressMessage.textContent =
                "Every new day is another chance.";
        }
    }

    function updateTodayHabitStatistics(habits) {
        const today = getTodayString();

        let successfulToday = 0;
        let missedToday = 0;
        let uncheckedToday = 0;

        habits.forEach(function (habit) {
            if (
                !habit.history ||
                habit.history[today] === undefined
            ) {
                uncheckedToday++;
            } else if (
                habit.history[today] === true
            ) {
                successfulToday++;
            } else {
                missedToday++;
            }
        });

        habitsSuccessfulTodayElement.textContent =
            successfulToday;

        habitsMissedTodayElement.textContent =
            missedToday;

        habitsUncheckedTodayElement.textContent =
            uncheckedToday;
    }

    function updateAchievement(
        completedTasks,
        successfulHabitDays
    ) {
        const totalWins =
            completedTasks + successfulHabitDays;

        if (totalWins >= 100) {
            achievementIcon.textContent = "👑";
            achievementTitle.textContent =
                "Ascendra Legend";

            achievementDescription.textContent =
                "You have collected at least 100 total wins.";
        } else if (totalWins >= 50) {
            achievementIcon.textContent = "🏆";
            achievementTitle.textContent =
                "Progress Champion";

            achievementDescription.textContent =
                "You have collected at least 50 total wins.";
        } else if (totalWins >= 25) {
            achievementIcon.textContent = "🔥";
            achievementTitle.textContent =
                "On Fire";

            achievementDescription.textContent =
                "You have collected at least 25 total wins.";
        } else if (totalWins >= 10) {
            achievementIcon.textContent = "⭐";
            achievementTitle.textContent =
                "Momentum Builder";

            achievementDescription.textContent =
                "You have collected at least 10 total wins.";
        } else if (totalWins >= 1) {
            achievementIcon.textContent = "✅";
            achievementTitle.textContent =
                "First Win";

            achievementDescription.textContent =
                "You recorded your first completed task or habit.";
        } else {
            achievementIcon.textContent = "🌱";
            achievementTitle.textContent =
                "Getting Started";

            achievementDescription.textContent =
                "Complete a task or habit check-in to begin.";
        }
    }

    function formatDate(dateString) {
        if (!dateString) {
            return "No due date";
        }

        const date = new Date(
            dateString + "T00:00:00"
        );

        return date.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    function displayRecentTasks(todos) {
        recentTasksContainer.innerHTML = "";

        if (todos.length === 0) {
            const emptyMessage =
                document.createElement("p");

            emptyMessage.classList.add(
                "empty-message"
            );

            emptyMessage.textContent =
                "No tasks yet. Your productivity empire awaits.";

            recentTasksContainer.appendChild(
                emptyMessage
            );

            return;
        }

        const recentTasks = todos.slice();

        recentTasks.sort(function (
            firstTask,
            secondTask
        ) {
            return secondTask.id - firstTask.id;
        });

        const limitedTasks =
            recentTasks.slice(0, 5);

        limitedTasks.forEach(function (todo) {
            const taskRow =
                document.createElement("div");

            taskRow.classList.add(
                "recent-task"
            );

            const taskInfo =
                document.createElement("div");

            taskInfo.classList.add(
                "recent-task-info"
            );

            const taskTitle =
                document.createElement("p");

            taskTitle.classList.add(
                "recent-task-title"
            );

            if (todo.completed === true) {
                taskTitle.textContent =
                    "✅ " + todo.task;
            } else {
                taskTitle.textContent =
                    "⬜ " + todo.task;
            }

            const taskDate =
                document.createElement("p");

            taskDate.classList.add(
                "recent-task-date"
            );

            taskDate.textContent =
                "Due: " + formatDate(todo.date);

            const taskStatus =
                document.createElement("span");

            taskStatus.classList.add(
                "task-status"
            );

            if (todo.completed === true) {
                taskStatus.classList.add(
                    "completed"
                );

                taskStatus.textContent =
                    "Completed";
            } else {
                taskStatus.classList.add(
                    "pending"
                );

                taskStatus.textContent =
                    "Pending";
            }

            taskInfo.appendChild(taskTitle);
            taskInfo.appendChild(taskDate);

            taskRow.appendChild(taskInfo);
            taskRow.appendChild(taskStatus);

            recentTasksContainer.appendChild(
                taskRow
            );
        });
    }

    function loadStats() {
        const todos =
            getStoredArray("todos");

        const habits =
            getStoredArray("habits");

        updateWelcomeMessage();

        const completedTasks =
            updateTaskStatistics(todos);

        updateTaskDateStatistics(todos);

        const successfulHabitDays =
            updateHabitStatistics(habits);

        updateTodayHabitStatistics(habits);

        updateAchievement(
            completedTasks,
            successfulHabitDays
        );

        displayRecentTasks(todos);
    }

    loadStats();

window.displayRecentTasks = displayRecentTasks;
window.formatDate = formatDate;
window.getStoredArray = getStoredArray;
window.getTodayString = getTodayString;
window.loadStats = loadStats;
window.updateAchievement = updateAchievement;
window.updateHabitProgressMessage = updateHabitProgressMessage;
window.updateHabitStatistics = updateHabitStatistics;
window.updateTaskDateStatistics = updateTaskDateStatistics;
window.updateTaskProgressMessage = updateTaskProgressMessage;
window.updateTaskStatistics = updateTaskStatistics;
window.updateTodayHabitStatistics = updateTodayHabitStatistics;
window.updateWelcomeMessage = updateWelcomeMessage;
},
"profile": function init_profile(){

    const nameInput = document.getElementById("name-input");
    const surnameInput = document.getElementById("surname-input");
    const usernameInput = document.getElementById("username-input");
    const bioInput = document.getElementById("bio-input");

    const displayName = document.getElementById("display-name");
    const displayUsername = document.getElementById("display-username");
    const displayBio = document.getElementById("display-bio");

    const saveButton = document.getElementById("save-button");
    const saveMessage = document.getElementById("save-message");

    const profileUpload = document.getElementById("profile-upload");
    const profilePicture = document.getElementById("profile-picture");

    const characterCount = document.getElementById("character-count");

    const streakNumber = document.getElementById("streak-number");
    const tasksNumber = document.getElementById("tasks-number");
    const achievementsNumber =
        document.getElementById("achievements-number");

    function loadProfile() {
        const savedName =
            localStorage.getItem("name") || "Ascendra";

        const savedSurname =
            localStorage.getItem("surname") || "User";

        const savedUsername =
            localStorage.getItem("username") || "ascendrauser";

        const savedBio =
            localStorage.getItem("ascendra-profile-bio") ||
            "Becoming better, one day at a time.";

        const savedPicture =
            localStorage.getItem("ascendra-profile-picture");

        nameInput.value = savedName;
        surnameInput.value = savedSurname;
        usernameInput.value = savedUsername;
        bioInput.value = savedBio;

        displayName.textContent =
            savedName + " " + savedSurname;

        displayUsername.textContent =
            "@" + savedUsername;

        displayBio.textContent = savedBio;

        characterCount.textContent =
            savedBio.length + " / 120";

        streakNumber.textContent =
            localStorage.getItem("ascendra-streak") || "0";

        tasksNumber.textContent =
            localStorage.getItem("ascendra-tasks-completed") || "0";

        achievementsNumber.textContent =
            localStorage.getItem("ascendra-achievements") || "0";

        if (savedPicture) {
            profilePicture.src = savedPicture;
        }
    }

    function cleanUsername(username) {
        return username
            .trim()
            .replace(/@/g, "")
            .replace(/\s+/g, "");
    }

    function showMessage(message, type) {
        saveMessage.textContent = message;

        if (type === "success") {
            saveMessage.className = "success-message";
        } else {
            saveMessage.className = "error-message";
        }

        setTimeout(function () {
            saveMessage.textContent = "";
            saveMessage.className = "";
        }, 3000);
    }

    saveButton.addEventListener("click", function () {
        const name = nameInput.value.trim();
        const surname = surnameInput.value.trim();
        const username = cleanUsername(usernameInput.value);
        const bio = bioInput.value.trim();

        if (name === "") {
            showMessage(
                "Please enter your first name.",
                "error"
            );

            return;
        }

        if (surname === "") {
            showMessage(
                "Please enter your surname.",
                "error"
            );

            return;
        }

        if (username === "") {
            showMessage(
                "Please enter a username.",
                "error"
            );

            return;
        }

        const oldUsername =
            localStorage.getItem("username");

        let savedPassword = "";

        if (oldUsername) {
            const oldUserData =
                localStorage.getItem(oldUsername);

            if (oldUserData) {
                try {
                    const oldUser =
                        JSON.parse(oldUserData);

                    savedPassword =
                        oldUser.password || "";
                } catch (error) {
                    console.error(
                        "Could not read saved user:",
                        error
                    );
                }
            }
        }

        const updatedUser = {
            name: name,
            surname: surname,
            username: username,
            password: savedPassword
        };

        localStorage.setItem("name", name);
        localStorage.setItem("surname", surname);
        localStorage.setItem("username", username);

        localStorage.setItem(
            "ascendra-profile-bio",
            bio
        );

        localStorage.setItem(
            username,
            JSON.stringify(updatedUser)
        );

        if (
            oldUsername &&
            oldUsername !== username
        ) {
            localStorage.removeItem(oldUsername);
        }

        displayName.textContent =
            name + " " + surname;

        displayUsername.textContent =
            "@" + username;

        displayBio.textContent =
            bio ||
            "Becoming better, one day at a time.";

        usernameInput.value = username;

        showMessage(
            "Profile saved successfully!",
            "success"
        );
    });

    bioInput.addEventListener("input", function () {
        characterCount.textContent =
            bioInput.value.length + " / 120";
    });

    profileUpload.addEventListener(
        "change",
        function (event) {
            const selectedFile =
                event.target.files[0];

            if (!selectedFile) {
                return;
            }

            if (
                !selectedFile.type.startsWith("image/")
            ) {
                showMessage(
                    "Please choose an image file.",
                    "error"
                );

                profileUpload.value = "";
                return;
            }

            const reader = new FileReader();

            reader.addEventListener(
                "load",
                function () {
                    profilePicture.src =
                        reader.result;

                    try {
                        localStorage.setItem(
                            "ascendra-profile-picture",
                            reader.result
                        );

                        showMessage(
                            "Profile picture updated!",
                            "success"
                        );
                    } catch (error) {
                        showMessage(
                            "That image is too large.",
                            "error"
                        );
                    }
                }
            );

            reader.readAsDataURL(selectedFile);
        }
    );

    loadProfile();

window.cleanUsername = cleanUsername;
window.loadProfile = loadProfile;
window.showMessage = showMessage;
},
"extras": function init_extras(){


},
"privacy": function init_privacy(){


},
"terms": function init_terms(){


},
"about": function init_about(){


},
"credits": function init_credits(){


},
"comingsoon": function init_comingsoon(){


},
"projects": function init_projects(){


}
};

if(!location.hash){history.replaceState({route:"welcome"},"","#/welcome");}
renderRoute(getRoute());
