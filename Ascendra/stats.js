
document.addEventListener("DOMContentLoaded", function () {
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
});


