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