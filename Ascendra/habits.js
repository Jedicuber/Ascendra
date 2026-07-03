const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitList = document.getElementById("habitList");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits(){
    localStorage.setItem("habits", JSON.stringify(habits));
}

function renderHabits(){

    habitList.innerHTML = "";

    habits.forEach((habit, index)=>{

        const row = document.createElement("div");
        row.classList.add("habit");

        const left = document.createElement("div");
        left.classList.add("left");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = habit.completed;

        checkbox.addEventListener("change", function(){

            habits[index].completed = checkbox.checked;

            saveHabits();

            renderHabits();

        });

        const text = document.createElement("span");

        text.textContent = habit.name;

        if(habit.completed){
            text.classList.add("completed");
        }

        left.appendChild(checkbox);
        left.appendChild(text);

        const right = document.createElement("div");
        right.classList.add("right");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function(){

            const newName = prompt("Edit habit", habit.name);

            if(newName && newName.trim() !== ""){

                habits[index].name = newName.trim();

                saveHabits();

                renderHabits();

            }

        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function(){

            habits.splice(index,1);

            saveHabits();

            renderHabits();

        });

        right.appendChild(editButton);
        right.appendChild(deleteButton);

        row.appendChild(left);
        row.appendChild(right);

        habitList.appendChild(row);

    });

}

function addHabit(){

    const name = habitInput.value.trim();

    if(name === ""){

        alert("Please enter a habit.");

        return;

    }

    habits.push({

        name:name,

        completed:false

    });

    habitInput.value = "";

    saveHabits();

    renderHabits();

}

addHabitBtn.addEventListener("click", addHabit);

habitInput.addEventListener("keydown", function(event){

    if(event.key === "Enter"){

        addHabit();

    }

});

renderHabits();
