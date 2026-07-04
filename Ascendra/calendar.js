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
