
"use strict";
const app = document.getElementById("app");
const backButton = document.getElementById("spaBackButton");
const initializedCleanups = new Map();
const PASSWORD_ITERATIONS = 600000;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function formatLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseLocalDateTime(value, fallbackTime = "") {
    const match = String(value || "").trim().match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/
    );
    if (!match) return null;

    const fallbackMatch = String(fallbackTime || "").match(/^(\d{1,2}):(\d{2})/);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4] ?? fallbackMatch?.[1] ?? 0);
    const minute = Number(match[5] ?? fallbackMatch?.[2] ?? 0);
    const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day ||
        parsed.getHours() !== hour ||
        parsed.getMinutes() !== minute
    ) {
        return null;
    }

    return parsed;
}

function dateKeyDayNumber(value) {
    const parsed = value instanceof Date ? value : parseLocalDateTime(value);
    if (!parsed) return Number.NaN;
    return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) / DAY_IN_MILLISECONDS;
}

function eventDateTime(event) {
    return parseLocalDateTime(event?.date, event?.time);
}

function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function derivePasswordDigest(password, salt, iterations) {
    if (!globalThis.crypto?.subtle) {
        throw new Error("Secure password storage requires HTTPS or localhost.");
    }

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations },
        keyMaterial,
        256
    );
    return new Uint8Array(bits);
}

async function createPasswordCredentials(password) {
    if (!globalThis.crypto?.subtle) {
        throw new Error("Secure password storage requires HTTPS or localhost.");
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const digest = await derivePasswordDigest(password, salt, PASSWORD_ITERATIONS);
    return {
        version: 1,
        kdf: "PBKDF2",
        hash: "SHA-256",
        iterations: PASSWORD_ITERATIONS,
        salt: bytesToBase64(salt),
        digest: bytesToBase64(digest)
    };
}

async function verifyPasswordCredentials(password, credentials) {
    if (
        !credentials ||
        credentials.kdf !== "PBKDF2" ||
        credentials.hash !== "SHA-256" ||
        !Number.isInteger(credentials.iterations) ||
        credentials.iterations < 100000 ||
        credentials.iterations > 1000000
    ) {
        return false;
    }

    let salt;
    let expected;
    try {
        salt = base64ToBytes(credentials.salt);
        expected = base64ToBytes(credentials.digest);
    } catch (error) {
        return false;
    }

    const actual = await derivePasswordDigest(password, salt, credentials.iterations);
    if (actual.length !== expected.length) return false;

    let difference = 0;
    for (let index = 0; index < actual.length; index++) {
        difference |= actual[index] ^ expected[index];
    }
    return difference === 0;
}

function accountStorageKey(username) {
    return `ascendra:user:${String(username || "").trim().toLowerCase()}`;
}

function readStoredJson(key) {
    if (!key) return null;
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        return null;
    }
}

function findStoredAccount(username) {
    const modernKey = accountStorageKey(username);
    const modernAccount = readStoredJson(modernKey);
    if (modernAccount && !Array.isArray(modernAccount)) {
        return { account: modernAccount, key: modernKey, legacy: false };
    }

    const requestedUsername = String(username || "").trim();
    const requestedUsernameLower = requestedUsername.toLowerCase();
    const legacyKeys = [requestedUsername];

    for (let index = 0; index < localStorage.length; index++) {
        const candidateKey = localStorage.key(index);
        if (
            candidateKey &&
            candidateKey.toLowerCase() === requestedUsernameLower &&
            !legacyKeys.includes(candidateKey)
        ) {
            legacyKeys.push(candidateKey);
        }
    }

    for (const legacyKey of legacyKeys) {
        const legacyAccount = readStoredJson(legacyKey);
        if (
            legacyAccount &&
            !Array.isArray(legacyAccount) &&
            (legacyAccount.credentials || typeof legacyAccount.password === "string")
        ) {
            return { account: legacyAccount, key: legacyKey, legacy: true };
        }
    }

    return null;
}

function saveStoredAccount(account) {
    localStorage.setItem(accountStorageKey(account.username), JSON.stringify(account));
}

function getLoggedInUsername() {
    return String(localStorage.getItem("loggedInUser") || "").trim().toLowerCase();
}

function userStorageKey(key, username = getLoggedInUsername()) {
    const cleanUsername = String(username || "").trim().toLowerCase();
    return cleanUsername ? `ascendra:data:${cleanUsername}:${key}` : `ascendra:guest:${key}`;
}

function getUserItem(key) {
    return localStorage.getItem(userStorageKey(key));
}

function setUserItem(key, value) {
    localStorage.setItem(userStorageKey(key), value);
}

function removeUserItem(key) {
    localStorage.removeItem(userStorageKey(key));
}

function moveUserDataNamespace(oldUsername, newUsername) {
    const oldClean = String(oldUsername || "").trim().toLowerCase();
    const newClean = String(newUsername || "").trim().toLowerCase();
    if (!oldClean || !newClean || oldClean === newClean) return;

    const oldPrefix = `ascendra:data:${oldClean}:`;
    const newPrefix = `ascendra:data:${newClean}:`;
    const keysToMove = [];
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(oldPrefix)) keysToMove.push(key);
    }

    for (const oldKey of keysToMove) {
        const suffix = oldKey.slice(oldPrefix.length);
        const newKey = newPrefix + suffix;
        if (localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, localStorage.getItem(oldKey));
        }
        localStorage.removeItem(oldKey);
    }

    const ownerKey = "ascendra:legacy-data-owner";
    if (String(localStorage.getItem(ownerKey) || "").toLowerCase() === oldClean) {
        localStorage.setItem(ownerKey, newClean);
    }
}

function deleteCurrentAccountData() {
    const username = getLoggedInUsername();
    if (!username) return;

    const dataPrefix = `ascendra:data:${username}:`;
    const keysToDelete = [];
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(dataPrefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(accountStorageKey(username));

    ["name", "surname", "username", "loggedInUser", "password"].forEach(key => {
        localStorage.removeItem(key);
    });
}

function migrateLegacyUserData(username) {
    const cleanUsername = String(username || "").trim().toLowerCase();
    if (!cleanUsername) return;

    const ownerKey = "ascendra:legacy-data-owner";
    const existingOwner = String(localStorage.getItem(ownerKey) || "").trim().toLowerCase();
    if (existingOwner && existingOwner !== cleanUsername) return;

    const legacyKeys = [
        "todos", "habits", "events", "ascendraSettings",
        "ascendra-profile-bio", "ascendra-profile-picture",
        "ascendra-streak", "ascendra-tasks-completed", "ascendra-achievements"
    ];

    let foundLegacyData = false;
    for (const key of legacyKeys) {
        const oldValue = localStorage.getItem(key);
        const newKey = userStorageKey(key, cleanUsername);
        if (oldValue !== null && localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, oldValue);
            foundLegacyData = true;
        }
    }

    const journalPrefix = "journal-";
    const journalKeys = [];
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(journalPrefix)) journalKeys.push(key);
    }
    for (const key of journalKeys) {
        const oldValue = localStorage.getItem(key);
        const newKey = userStorageKey(key, cleanUsername);
        if (oldValue !== null && localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, oldValue);
            foundLegacyData = true;
        }
    }

    if (foundLegacyData || !existingOwner) {
        localStorage.setItem(ownerKey, cleanUsername);
    }
}

function createModalController(dialog, initialFocus, options = {}) {
    const focusableSelector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
    ].join(",");
    let previousFocus = null;

    function getFocusableElements() {
        return [...dialog.querySelectorAll(focusableSelector)]
            .filter(element => element.getClientRects().length > 0);
    }

    function close({ restoreFocus = true } = {}) {
        dialog.style.display = "none";
        dialog.setAttribute("aria-hidden", "true");
        document.removeEventListener("keydown", handleKeydown);
        options.onClose?.();

        if (restoreFocus && previousFocus?.isConnected) {
            previousFocus.focus();
        }
        previousFocus = null;
    }

    function handleKeydown(event) {
        if (dialog.getAttribute("aria-hidden") !== "false") return;

        if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
        }

        if (event.key !== "Tab") return;
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
            event.preventDefault();
            dialog.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!dialog.contains(document.activeElement)) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function open() {
        previousFocus = document.activeElement;
        dialog.style.display = options.display || "block";
        dialog.setAttribute("aria-hidden", "false");
        options.onOpen?.();
        document.addEventListener("keydown", handleKeydown);

        requestAnimationFrame(() => {
            if (dialog.getAttribute("aria-hidden") !== "false") return;
            const target = typeof initialFocus === "function" ? initialFocus() : initialFocus;
            (target || getFocusableElements()[0] || dialog).focus();
        });
    }

    function destroy() {
        document.removeEventListener("keydown", handleKeydown);
        dialog.setAttribute("aria-hidden", "true");
        previousFocus = null;
    }

    return { open, close, destroy };
}

localStorage.removeItem("password");

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
    let s=null; try{s=JSON.parse(getUserItem("ascendraSettings"));}catch(e){}
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
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let animationFrame = null;

// Resize canvas and create stars
function resizeCanvas() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = viewportWidth + "px";
    canvas.style.height = viewportHeight + "px";
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    backgroundStars = [];

    // Create random stars
    for (let i = 0; i < 75; i++) {
        backgroundStars.push({
            x: Math.random() * viewportWidth,
            y: Math.random() * viewportHeight,
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
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Draw random stars
    for (const star of backgroundStars) {
        circle(star.x, star.y, star.size, star.color);
    }

    // Center the shooting star
    ctx.save();

    const sceneScale = Math.min(1, viewportWidth * 0.9 / 400, viewportHeight * 0.9 / 400);
    const offsetX = (viewportWidth - 400 * sceneScale) / 2;
    const offsetY = (viewportHeight - 400 * sceneScale) / 2;
    ctx.translate(offsetX, offsetY);
    ctx.scale(sceneScale, sceneScale);

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

    animationFrame = requestAnimationFrame(draw);
}

draw();
return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", resizeCanvas);
};
},
"login": function init_login(){
const loginForm = document.getElementById("login");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitButton = loginForm.querySelector('[type="submit"]');

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const record = findStoredAccount(username);

    submitButton.disabled = true;
    try {
        let savedUser = record?.account || null;
        let passwordMatches = false;
        let needsMigration = false;

        if (savedUser?.credentials) {
            passwordMatches = await verifyPasswordCredentials(password, savedUser.credentials);
            needsMigration = passwordMatches && (
                savedUser.credentials.iterations < PASSWORD_ITERATIONS ||
                typeof savedUser.password === "string"
            );
        } else if (savedUser && typeof savedUser.password === "string") {
            passwordMatches = savedUser.password === password;
            needsMigration = passwordMatches;
        }

        if (!passwordMatches) {
            alert("Wrong username or password!");
            passwordInput.value = "";
            passwordInput.focus();
            return;
        }

        if (needsMigration) {
            savedUser = {
                ...savedUser,
                username: savedUser.username || username,
                credentials: await createPasswordCredentials(password)
            };
            delete savedUser.password;
            saveStoredAccount(savedUser);
            if (record.key !== accountStorageKey(savedUser.username)) {
                localStorage.removeItem(record.key);
            }
        }

        const savedUsername = savedUser.username || username;
        localStorage.setItem("name", savedUser.name || "");
        localStorage.setItem("surname", savedUser.surname || "");
        localStorage.setItem("username", savedUsername);
        localStorage.setItem("loggedInUser", savedUsername);
        migrateLegacyUserData(savedUsername);
        localStorage.removeItem("password");
        alert("Welcome back, " + (savedUser.name || savedUsername) + "!");
        loginForm.reset();
        navigate("home");
    } catch (error) {
        console.error("Could not verify the account:", error);
        alert(error.message || "Could not securely verify this account.");
    } finally {
        submitButton.disabled = false;
    }
});

},
"signup": function init_signup(){
const signupForm = document.getElementById("signupForm");
const submitButton = signupForm.querySelector('[type="submit"]');

signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();

const name = document.getElementById("name").value.trim();
const surname = document.getElementById("surname").value.trim();
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value;

    if (password.length < 8) {
        alert("Use a password with at least 8 characters.");
        return;
    }

    if (findStoredAccount(username)) {
        alert("That username is already in use.");
        return;
    }

    submitButton.disabled = true;
    try {
        const user = {
            version: 2,
            name,
            surname,
            username,
            credentials: await createPasswordCredentials(password)
        };

        saveStoredAccount(user);
        localStorage.setItem("name", name);
        localStorage.setItem("surname", surname);
        localStorage.setItem("username", username);
        localStorage.setItem("loggedInUser", username);
        migrateLegacyUserData(username);
        localStorage.removeItem("password");

        alert("Account created!");
        signupForm.reset();
        navigate("home");
    } catch (error) {
        console.error("Could not create the account:", error);
        alert(error.message || "Could not securely create this account.");
    } finally {
        submitButton.disabled = false;
    }
});

},
"home": function init_home(){
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

const todayDayNumber = dateKeyDayNumber(now);

const todos = JSON.parse(getUserItem("todos")) || [];
const events = JSON.parse(getUserItem("events")) || [];
const habits = JSON.parse(getUserItem("habits")) || [];

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
        .filter(event => {
            const date = eventDateTime(event);
            return date && dateKeyDayNumber(date) >= todayDayNumber;
        })
        .sort((a, b) => {
            const dateA = eventDateTime(a);
            const dateB = eventDateTime(b);
            return (dateA?.getTime() ?? Number.POSITIVE_INFINITY) -
                (dateB?.getTime() ?? Number.POSITIVE_INFINITY);
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

const starInterval = setInterval(() => {

    createStar();

}, Math.random() * 4000 + 3000);

return () => clearInterval(starInterval);
},
    
"alerts": function init_alerts() {
    const alertList = document.getElementById("alertList");

    const todos = JSON.parse(getUserItem("todos")) || [];

    function isCompleted(todo) {
        return (
            todo.completed === true ||
            todo.completed === "true" ||
            todo.done === true ||
            todo.done === "true"
        );
    }

    const unfinishedTodos = todos.filter(todo => !isCompleted(todo));

    alertList.innerHTML = "";

    if (unfinishedTodos.length === 0) {
        alertList.innerHTML = "<p>No alerts 🎉</p>";
        return;
    }

    unfinishedTodos.sort(
        (a, b) => dateKeyDayNumber(a.date) - dateKeyDayNumber(b.date)
    );

    const todayDayNumber = dateKeyDayNumber(new Date());
    console.log(todos);

        unfinishedTodos.forEach(todo => {
        const card = document.createElement("div");
        card.classList.add("alert-card");

        const dueDayNumber = dateKeyDayNumber(todo.date);
        const daysLeft = dueDayNumber - todayDayNumber;

        let status = "";

        if (!Number.isFinite(daysLeft)) {
            status = "Date unavailable";
        } else if (daysLeft < 0) {
            status = "🔴 Overdue";
        } else if (daysLeft === 0) {
            status = "🟠 Due Today";
        } else if (daysLeft === 1) {
            status = "🟡 Due Tomorrow";
        } else {
            status = `🟢 Due in ${daysLeft} days`;
        }

        const title = document.createElement("h3");
        const date = document.createElement("p");
        const statusText = document.createElement("p");

        title.textContent = todo.task;
        date.textContent = `📅 ${todo.date}`;
        statusText.textContent = status;

        card.append(title, date, statusText);
        alertList.appendChild(card);
    });

},

"todos": function init_todos() {

    const addBtn = document.getElementById("add-btn");
    const popup = document.getElementById("popup");
    const cancelBtn = document.getElementById("cancel-btn");
    const todoForm = document.getElementById("todo-form");

    const taskInput = document.getElementById("task-input");
    const priorityInput = document.getElementById("priority-input");
    const estimatedInput = document.getElementById("estimated-input");
    const noDateInput = document.getElementById("no-date-input");
    const dueDateFields = document.getElementById("due-date-fields");
    const dateInput = document.getElementById("date-input");
    const timeInput = document.getElementById("time-input");
    const notesInput = document.getElementById("notes-input");

    const todoList = document.getElementById("todo-list");
    const todoSummary = document.getElementById("todo-summary");
    const filterButtons = [...document.querySelectorAll(".todo-filter")];

    const modal = createModalController(popup, taskInput, {
        onClose: () => {
            todoForm.reset();
            priorityInput.value = "medium";
            updateDueDateFields();
        }
    });

    let todos = JSON.parse(getUserItem("todos")) || [];
    let activeFilter = "all";

    function saveTodos() {
        setUserItem("todos", JSON.stringify(todos));
    }

    function updateDueDateFields() {
        const hasNoDueDate = noDateInput.checked;

        dateInput.disabled = hasNoDueDate;
        timeInput.disabled = hasNoDueDate;
        dueDateFields.classList.toggle("disabled", hasNoDueDate);

        if (hasNoDueDate) {
            dateInput.value = "";
            timeInput.value = "";
        }
    }

    function formatPriority(priority) {
        if (priority === "high") return "🔴 High";
        if (priority === "low") return "🟢 Low";
        return "🟡 Medium";
    }

    function formatDueDate(todo) {
        if (!todo.date) {
            return "No due date";
        }

        if (todo.time) {
            return `Due: ${todo.date} at ${todo.time}`;
        }

        return `Due: ${todo.date}`;
    }

    function sortTodos(a, b) {
        if (!a.date && !b.date) {
            return Number(a.id) - Number(b.id);
        }

        if (!a.date) return 1;
        if (!b.date) return -1;

        const dateComparison = String(a.date).localeCompare(String(b.date));

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return String(a.time || "").localeCompare(String(b.time || ""));
    }

    function showTodos() {
        todoList.innerHTML = "";

        const remaining = todos.filter(todo => !todo.completed).length;

        todoSummary.textContent =
            `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;

        const visibleTodos = todos
            .filter(todo => {
                if (activeFilter === "completed") {
                    return todo.completed;
                }

                if (activeFilter === "active") {
                    return !todo.completed;
                }

                return true;
            })
            .sort(sortTodos);

        if (visibleTodos.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "todo-empty";

            emptyMessage.textContent =
                todos.length === 0
                    ? "No tasks yet"
                    : `No ${activeFilter} tasks`;

            todoList.appendChild(emptyMessage);
            return;
        }

        visibleTodos.forEach(todo => {
            const card = document.createElement("div");
            card.classList.add("todo-card");

            if (todo.completed) {
                card.classList.add("completed");
            }

            const info = document.createElement("div");
            info.className = "todo-info";

            const title = document.createElement("div");
            title.className = "todo-title";
            title.textContent = todo.task;

            const dueDate = document.createElement("div");
            dueDate.className = "todo-date";
            dueDate.textContent = formatDueDate(todo);

            const priority = document.createElement("div");
            priority.className = `todo-priority priority-${todo.priority || "medium"}`;
            priority.textContent = `Priority: ${formatPriority(todo.priority)}`;

            info.append(title, dueDate, priority);

            if (todo.estimatedMinutes) {
                const estimate = document.createElement("div");
                estimate.className = "todo-estimate";
                estimate.textContent =
                    `Estimated time: ${todo.estimatedMinutes} min`;

                info.appendChild(estimate);
            }

            if (todo.notes) {
                const notes = document.createElement("p");
                notes.className = "todo-notes";
                notes.textContent = todo.notes;

                info.appendChild(notes);
            }

            const completeBtn = document.createElement("button");
            completeBtn.className = "complete-btn";
            completeBtn.type = "button";
            completeBtn.textContent = todo.completed ? "Undo" : "Done";

            completeBtn.setAttribute(
                "aria-label",
                `${todo.completed ? "Mark incomplete" : "Mark complete"}: ${todo.task}`
            );

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";

            deleteBtn.setAttribute(
                "aria-label",
                `Delete task: ${todo.task}`
            );

            completeBtn.onclick = () => {
                todo.completed = !todo.completed;
                saveTodos();
                showTodos();
            };

            deleteBtn.onclick = () => {
                todos = todos.filter(savedTodo => savedTodo.id !== todo.id);
                saveTodos();
                showTodos();
            };

            card.append(info, completeBtn, deleteBtn);
            todoList.appendChild(card);
        });
    }

    addBtn.onclick = () => {
        dateInput.min = formatLocalDate();
        priorityInput.value = "medium";
        noDateInput.checked = false;
        updateDueDateFields();
        modal.open();
    };

    cancelBtn.onclick = () => {
        modal.close();
    };

    noDateInput.onchange = () => {
        updateDueDateFields();
    };

    filterButtons.forEach(button => {
        button.onclick = () => {
            activeFilter = button.dataset.filter;

            filterButtons.forEach(item => {
                const selected = item === button;

                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });

            showTodos();
        };

        button.setAttribute(
            "aria-pressed",
            String(button.dataset.filter === activeFilter)
        );
    });

    todoForm.onsubmit = event => {
        event.preventDefault();

        const task = taskInput.value.trim();
        const noDueDate = noDateInput.checked;
        const date = noDueDate ? null : dateInput.value;
        const time = noDueDate ? null : timeInput.value;
        const priority = priorityInput.value;
        const notes = notesInput.value.trim();

        const estimatedMinutes =
            estimatedInput.value === ""
                ? null
                : Number(estimatedInput.value);

        if (task === "") {
            alert("Add a task name first!");
            return;
        }

        if (!noDueDate && date === "") {
            alert("Choose a due date or select No due date.");
            return;
        }

        if (
            estimatedMinutes !== null &&
            (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 1)
        ) {
            alert("Estimated minutes must be at least 1.");
            return;
        }

        todos.push({
            id: Date.now(),
            task: task,
            date: date,
            time: time,
            priority: priority,
            notes: notes,
            estimatedMinutes: estimatedMinutes,
            completed: false
        });

        saveTodos();
        showTodos();
        modal.close();
    };

    popup.onclick = event => {
        if (event.target === popup) {
            modal.close();
        }
    };

    updateDueDateFields();
    showTodos();

    window.saveTodos = saveTodos;
    window.showTodos = showTodos;

    return () => modal.destroy();
},
"habits": function init_habits() {

    const addHabitBtn = document.getElementById("addHabitBtn");
    const habitPopup = document.getElementById("habitPopup");
    const habitForm = document.getElementById("habitForm");
    const cancelHabitBtn = document.getElementById("cancelHabitBtn");

    const habitInput = document.getElementById("habitInput");
    const habitEmoji = document.getElementById("habitEmoji");
    const habitType = document.getElementById("habitType");
    const habitFrequency = document.getElementById("habitFrequency");
    const habitGoal = document.getElementById("habitGoal");
    const habitUnit = document.getElementById("habitUnit");
    const habitReminder = document.getElementById("habitReminder");
    const noReminderInput = document.getElementById("noReminderInput");
    const reminderFields = document.getElementById("reminderFields");
    const habitNotes = document.getElementById("habitNotes");

    const habitList = document.getElementById("habitList");

    const modal = createModalController(habitPopup, habitInput, {
        display: "flex",

        onClose: () => {
            habitForm.reset();
            habitType.value = "good";
            habitFrequency.value = "daily";
            updateReminderFields();
        }
    });

    let habits = JSON.parse(getUserItem("habits")) || [];

    function saveHabits() {
        setUserItem("habits", JSON.stringify(habits));
    }

    function getToday() {
        return formatLocalDate();
    }

    function updateReminderFields() {
        const noReminder = noReminderInput.checked;

        habitReminder.disabled = noReminder;
        reminderFields.classList.toggle("disabled", noReminder);

        if (noReminder) {
            habitReminder.value = "";
        }
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
        const result = habit.history?.[today];

        if (result === true) {
            return habit.type === "bad"
                ? "Avoided today ✅"
                : "Completed today ✅";
        }

        if (result === false) {
            return habit.type === "bad"
                ? "Habit happened today ❌"
                : "Missed today ❌";
        }

        return "Not checked today";
    }

    function getFrequencyText(frequency) {
        if (frequency === "weekdays") {
            return "Weekdays";
        }

        if (frequency === "weekends") {
            return "Weekends";
        }

        return "Every day";
    }

    function getPreviousDateKey(dateKey) {
        const date = parseLocalDateTime(dateKey);

        if (!date) {
            return null;
        }

        date.setDate(date.getDate() - 1);
        return formatLocalDate(date);
    }

    function getCurrentStreak(habit) {
        const history = habit.history || {};
        let dateKey = getToday();
        let streak = 0;

        while (history[dateKey] === true) {
            streak++;

            dateKey = getPreviousDateKey(dateKey);

            if (!dateKey) {
                break;
            }
        }

        return streak;
    }

    function showHabits() {
        habitList.innerHTML = "";

        if (habits.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "habit-empty";
            emptyMessage.textContent = "No habits yet";
            habitList.appendChild(emptyMessage);
            return;
        }

        habits.forEach(habit => {
            const habitCard = document.createElement("div");
            habitCard.classList.add("habit");

            const leftSide = document.createElement("div");
            leftSide.classList.add("left");

            const habitTitle = document.createElement("div");
            habitTitle.classList.add("habit-title");

            const emoji = habit.emoji ? `${habit.emoji} ` : "";
            habitTitle.textContent = `${emoji}${habit.name}`;

            const habitTypeText = document.createElement("div");
            habitTypeText.classList.add("habit-type");

            habitTypeText.textContent =
                habit.type === "bad"
                    ? "Bad habit"
                    : "Good habit";

            const habitFrequencyText = document.createElement("div");
            habitFrequencyText.classList.add("habit-frequency");
            habitFrequencyText.textContent =
                `Frequency: ${getFrequencyText(habit.frequency)}`;

            const habitResult = document.createElement("div");
            habitResult.classList.add("habit-result");
            habitResult.textContent = getHabitResultText(habit);

            const habitStreak = document.createElement("div");
            habitStreak.classList.add("habit-streak");

            const streak = getCurrentStreak(habit);
            habitStreak.textContent =
                `🔥 ${streak} day${streak === 1 ? "" : "s"} streak`;

            leftSide.append(
                habitTitle,
                habitTypeText,
                habitFrequencyText,
                habitResult,
                habitStreak
            );

            if (habit.goal && habit.unit) {
                const goalText = document.createElement("div");
                goalText.classList.add("habit-goal");
                goalText.textContent =
                    `Goal: ${habit.goal} ${habit.unit}`;

                leftSide.appendChild(goalText);
            }

            if (habit.reminder) {
                const reminderText = document.createElement("div");
                reminderText.classList.add("habit-reminder");
                reminderText.textContent =
                    `Reminder: ${habit.reminder}`;

                leftSide.appendChild(reminderText);
            }

            if (habit.notes) {
                const notesText = document.createElement("p");
                notesText.classList.add("habit-notes");
                notesText.textContent = habit.notes;

                leftSide.appendChild(notesText);
            }

            const rightSide = document.createElement("div");
            rightSide.classList.add("right");

            const checkButton = document.createElement("button");
            checkButton.classList.add("check-btn");
            checkButton.type = "button";
            checkButton.textContent = "✅";

            checkButton.setAttribute(
                "aria-label",
                `Mark ${habit.name} successful today`
            );

            const xButton = document.createElement("button");
            xButton.classList.add("x-btn");
            xButton.type = "button";
            xButton.textContent = "❌";

            xButton.setAttribute(
                "aria-label",
                `Mark ${habit.name} missed today`
            );

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-btn");
            deleteButton.type = "button";
            deleteButton.textContent = "🗑️";

            deleteButton.setAttribute(
                "aria-label",
                `Delete habit: ${habit.name}`
            );

            checkButton.onclick = () => {
                saveHabitResult(habit, true);
                showHabits();
            };

            xButton.onclick = () => {
                saveHabitResult(habit, false);
                showHabits();
            };

            deleteButton.onclick = () => {
                habits = habits.filter(savedHabit => {
                    return savedHabit.id !== habit.id;
                });

                saveHabits();
                showHabits();
            };

            rightSide.append(
                checkButton,
                xButton,
                deleteButton
            );

            habitCard.append(
                leftSide,
                rightSide
            );

            habitList.appendChild(habitCard);
        });
    }

    addHabitBtn.onclick = () => {
        habitType.value = "good";
        habitFrequency.value = "daily";
        noReminderInput.checked = false;

        updateReminderFields();
        modal.open();
    };

    cancelHabitBtn.onclick = () => {
        modal.close();
    };

    noReminderInput.onchange = () => {
        updateReminderFields();
    };

    habitPopup.onclick = event => {
        if (event.target === habitPopup) {
            modal.close();
        }
    };

habitForm.onsubmit = event => {
    event.preventDefault();

    const name = habitInput.value.trim();
    const emoji = habitEmoji.value.trim();
    const unit = habitUnit.value.trim();
    const notes = habitNotes.value.trim();

    const goal =
        habitGoal.value === ""
            ? null
            : Number(habitGoal.value);

    const reminder =
        noReminderInput.checked
            ? null
            : habitReminder.value || null;

    if (name === "") {
        alert("Add a habit name first!");
        return;
    }

    if (
        goal !== null &&
        (!Number.isFinite(goal) || goal < 1)
    ) {
        alert("The habit goal must be at least 1.");
        return;
    }

    if (goal !== null && unit === "") {
        alert("Add a unit for your goal.");
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        emoji: emoji,
        type: habitType.value,
        frequency: habitFrequency.value,
        goal: goal,
        unit: unit,
        reminder: reminder,
        notes: notes,
        history: {}
    };

    habits.push(newHabit);

    saveHabits();
    showHabits();
    modal.close();
};

updateReminderFields();
showHabits();

window.getHabitResultText = getHabitResultText;
window.getToday = getToday;
window.saveHabitResult = saveHabitResult;
window.saveHabits = saveHabits;
window.showHabits = showHabits;

return () => modal.destroy();
},

"breathing": function init_breathing() {
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
const closePopupButton = document.getElementById("closePopup");
const saveEvent = document.getElementById("saveEvent");

const eventTitleInput = document.getElementById("eventTitle");
const eventDateInput = document.getElementById("eventDate");

let events = JSON.parse(getUserItem("events")) || [];

const eventPicker = flatpickr(eventDateInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    altInput: true,
    altFormat: "F j, Y h:i K",
    minDate: "today"
});
eventPicker.altInput?.setAttribute("aria-label", "Event date and time");

const modal = createModalController(popup, eventTitleInput, {
    display: "flex",
    onClose: () => {
        eventTitleInput.value = "";
        eventPicker.clear();
    }
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
        const eventDate = eventDateTime(event);

        if (
            eventDate &&
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
                    setUserItem("events", JSON.stringify(events));
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
    modal.open();
};

closePopupButton.onclick = () => {
    modal.close();
};

popup.onclick = event => {
    if (event.target === popup) modal.close();
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

    setUserItem("events", JSON.stringify(events));

    renderCalendar();
    modal.close();
};

renderCalendar();
window.renderCalendar = renderCalendar;
window.showEventsForDay = showEventsForDay;
return () => {
    modal.destroy();
    eventPicker.destroy();
};
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

    const entry = JSON.parse(getUserItem(getEntryKey(day)));

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

        if (getUserItem(getEntryKey(day))) {
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

    setUserItem(getEntryKey(selectedDay), JSON.stringify(entry));

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
const buttons = document.querySelectorAll("#nav button");

const compactMenuQuery = window.matchMedia("(max-width: 768px), (max-height: 500px)");

function clearOrbitPositions() {
    buttons.forEach(button => {
        button.style.left = "";
        button.style.top = "";
        button.style.transform = "";
    });
}

const radius = 240;
let angle = 0;
let paused = false;
let animationFrame = null;

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

    if (compactMenuQuery.matches) {
        clearOrbitPositions();
        animationFrame = null;
        return;
    }

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

    animationFrame = requestAnimationFrame(animate);

}

function syncMenuLayout() {
    if (compactMenuQuery.matches) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        clearOrbitPositions();
    } else if (animationFrame === null) {
        animate();
    }
}

window.addEventListener("resize", syncMenuLayout);
syncMenuLayout();
return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", syncMenuLayout);
};
},
"settings": function init_settings() {

    function resetSettings() {
        const confirmReset = confirm(
            "Reset Ascendra settings back to default?"
        );

        if (confirmReset) {
            removeUserItem("ascendraSettings");
            applySavedSettings();
            alert("Settings reset.");
        }
    }

    function deleteAllData() {
        const warning = prompt(
            "Type DELETE to delete all local Ascendra data."
        );

        if (warning === "DELETE") {
            deleteCurrentAccountData();
            alert("This account and its Ascendra data have been deleted.");
            navigate("welcome");
        } else if (warning !== null) {
            alert("Delete cancelled.");
        }
    }

    window.resetSettings = resetSettings;
    window.deleteAllData = deleteAllData;
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
        const savedData = getUserItem(key);

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
    let messageTimeout = null;

    function loadProfile() {
        const savedName =
            localStorage.getItem("name") || "Ascendra";

        const savedSurname =
            localStorage.getItem("surname") || "User";

        const savedUsername =
            localStorage.getItem("username") || "ascendrauser";

        const savedBio =
            getUserItem("ascendra-profile-bio") ||
            "Becoming better, one day at a time.";

        const savedPicture =
            getUserItem("ascendra-profile-picture");

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
            getUserItem("ascendra-streak") || "0";

        tasksNumber.textContent =
            getUserItem("ascendra-tasks-completed") || "0";

        achievementsNumber.textContent =
            getUserItem("ascendra-achievements") || "0";

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

        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(function () {
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
        const accountRecord = findStoredAccount(oldUsername);
        const usernameRecord = findStoredAccount(username);

        if (usernameRecord && usernameRecord.key !== accountRecord?.key) {
            showMessage("That username is already in use.", "error");
            return;
        }

        if (
            accountRecord?.legacy &&
            oldUsername !== username &&
            typeof accountRecord.account.password === "string"
        ) {
            showMessage("Log in once before changing this legacy username.", "error");
            return;
        }

        if (accountRecord) {
            const updatedUser = {
                ...accountRecord.account,
                name,
                surname,
                username
            };

            if (accountRecord.legacy && typeof updatedUser.password === "string") {
                localStorage.setItem(accountRecord.key, JSON.stringify(updatedUser));
            } else {
                saveStoredAccount(updatedUser);
                const updatedKey = accountStorageKey(username);
                if (accountRecord.key !== updatedKey) {
                    localStorage.removeItem(accountRecord.key);
                }
            }
        }

        moveUserDataNamespace(oldUsername, username);

        localStorage.setItem("name", name);
        localStorage.setItem("surname", surname);
        localStorage.setItem("username", username);

        if (localStorage.getItem("loggedInUser")) {
            localStorage.setItem("loggedInUser", username);
        }

        setUserItem(
            "ascendra-profile-bio",
            bio
        );

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
                        setUserItem(
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
return () => clearTimeout(messageTimeout);
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

document.addEventListener("keydown", function(event) {

    // keyboard shortcuts
});

const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const searchablePages = [
    { name: "Home", route: "home" },
    { name: "Calendar", route: "calendar" },
    { name: "Journal", route: "journal" },
    { name: "Habits", route: "habits" },
    { name: "Tasks", route: "tasks" },
    { name: "Profile", route: "profile" },
    { name: "Statistics", route: "statistics" },
    { name: "Settings", route: "settings" }
];

function openSearch() {
    searchOverlay.hidden = false;
    searchInput.value = "";
    showSearchResults(searchablePages);
    searchInput.focus();
}

function closeSearch() {
    searchOverlay.hidden = true;
}

function showSearchResults(pages) {
    searchResults.innerHTML = "";

    if (pages.length === 0) {
        searchResults.innerHTML =
            '<p class="no-results">No results found</p>';
        return;
    }

    pages.forEach(function(page) {
        const button = document.createElement("button");

        button.className = "search-result";
        button.textContent = page.name;

        button.addEventListener("click", function() {
            navigate(page.route);
            closeSearch();
        });

        searchResults.appendChild(button);
    });
}

searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase().trim();

    const matches = searchablePages.filter(function(page) {
        return page.name.toLowerCase().includes(searchText);
    });

    showSearchResults(matches);
});
document.addEventListener("keydown", function(event) {
    console.log(event.key, event.ctrlKey, event.shiftKey);

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
        console.log("Shortcut works!");
    }
});
searchOverlay.addEventListener("click", function(event) {
    if (event.target === searchOverlay) {
        closeSearch();
    }
});
