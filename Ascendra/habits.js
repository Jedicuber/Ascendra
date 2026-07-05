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

function showHabits() {
    habitList.innerHTML = "";

    habits.forEach(habit => {
        const habitCard = document.createElement("div");
        habitCard.classList.add("habit");

        habitCard.innerHTML = `
            <div class="left">
                <div class="habit-title">${habit.name}</div>
                <div class="habit-type">${habit.type === "bad" ? "Bad habit" : "Good habit"}</div>
            </div>

            <div class="right">
                <button class="check-btn">✅</button>
                <button class="x-btn">❌</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `;

        habitCard.querySelector(".check-btn").onclick = () => {
            if (habit.type === "bad") {
                alert("Nice! You avoided the bad habit ✅");
            } else {
                alert("Nice! You did the good habit ✅");
            }
        };

        habitCard.querySelector(".x-btn").onclick = () => {
            if (habit.type === "bad") {
                alert("You did the bad habit today ❌");
            } else {
                alert("You missed the good habit today ❌");
            }
        };

        habitCard.querySelector(".delete-btn").onclick = () => {
            habits = habits.filter(h => h.id !== habit.id);
            saveHabits();
            showHabits();
        };

        habitList.appendChild(habitCard);
    });
}

addHabitBtn.onclick = () => {
    habitPopup.style.display = "block";
    habitInput.focus();
};

cancelHabitBtn.onclick = () => {
    habitPopup.style.display = "none";
    habitInput.value = "";
};

saveHabitBtn.onclick = () => {
    const name = habitInput.value.trim();

    if (name === "") {
        alert("Add a habit name first!");
        return;
    }

    habits.push({
        id: Date.now(),
        name: name,
        type: habitType.value
    });

    saveHabits();
    showHabits();

    habitPopup.style.display = "none";
    habitInput.value = "";
};

showHabits();
