function calendar() {
    window.location.href = "calendar.html";
}

const upcomingEvents = document.getElementById("upcomingEvents");

// Load events from localStorage
let events = JSON.parse(localStorage.getItem("events")) || [];

// Current date and time
const now = new Date();

// Keep only upcoming events
events = events.filter(event => new Date(event.date) >= now);

// Sort by soonest first
events.sort((a, b) => new Date(a.date) - new Date(b.date));

// Show the next 3 events
if (events.length === 0) {
    upcomingEvents.innerHTML = "<p>No upcoming events.</p>";
} else {
    events.slice(0, 3).forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("home-event");

        const eventDate = new Date(event.date);

        eventDiv.innerHTML = `
            <strong>${event.title}</strong><br>
            <small>${eventDate.toLocaleString()}</small>
        `;

        upcomingEvents.appendChild(eventDiv);
    });
}
