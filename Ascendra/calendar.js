const today = new Date();

const currentDay = today.getDate();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

document.querySelector(".calendar-header h2").textContent =
    `${monthNames[currentMonth]} ${currentYear}`;

const todayCell = document.getElementById(`day-${currentDay}`);

if (todayCell) {
    todayCell.classList.add("today");
}

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

function showEventOnCalendar(event) {
    const selectedDate = new Date(event.date);
    const selectedDay = selectedDate.getDate();

    const dayCell = document.getElementById(`day-${selectedDay}`);

    if (dayCell) {
        const eventText = document.createElement("div");
        eventText.classList.add("calendar-event");
        eventText.textContent = event.title;

        eventText.addEventListener("click", () => {
            if (confirm(`Delete "${event.title}"?`)) {
                events = events.filter(e => e.id !== event.id);
                localStorage.setItem("events", JSON.stringify(events));
                eventText.remove();
            }
        });

        dayCell.appendChild(eventText);
    }
}

function loadEvents() {
    events.forEach(event => {
        showEventOnCalendar(event);
    });
}

addEventBtn.addEventListener("click", () => {
    popup.style.display = "block";
});

closePopup.addEventListener("click", () => {
    popup.style.display = "none";
});

saveEvent.addEventListener("click", () => {
    const title = eventTitleInput.value.trim();
    const dateValue = eventDateInput.value;

    if (title === "" || dateValue === "") {
        alert("Add an event name and date first!");
        return;
    }

    const newEvent = {
        id: Date.now(),
        title: title,
        date: dateValue
    };

    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));

    showEventOnCalendar(newEvent);

    eventTitleInput.value = "";
    eventDateInput.value = "";

    popup.style.display = "none";
});

loadEvents();
