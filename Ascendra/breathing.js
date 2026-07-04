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