function goTo(page) {
    window.location.href = page;
}

const buttons = document.querySelectorAll("#nav button");

const radius = 240;
let angle = 0;
let paused = false;

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

    requestAnimationFrame(animate);

}

animate();
