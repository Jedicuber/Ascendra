const today = new Date();

const currentDay = today.getDate();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Change the calendar header
document.querySelector(".calendar-header").textContent =
    monthNames[currentMonth] + " " + currentYear;

// Highlight today's date
const todayCell = document.getElementById(`day-${currentDay}`);

if (todayCell) {
    todayCell.classList.add("today");
}