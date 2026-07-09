const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let backgroundStars = [];

// Resize canvas and create stars
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    backgroundStars = [];

    // Create random stars
    for (let i = 0; i < 75; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 1,
            color: Math.random() < 0.85
                ? "white"
                : "rgb(242,241,153)"
        });
    }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Shooting star variables
let xPos = 300;
let yPos = 100;
let starSize = 8;
let starEdge = 12;

// Draw a circle
function circle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw random stars
    for (const star of backgroundStars) {
        circle(star.x, star.y, star.size, star.color);
    }

    // Center the shooting star
    ctx.save();

    const offsetX = (canvas.width - 400) / 2;
    const offsetY = (canvas.height - 400) / 2;
    ctx.translate(offsetX, offsetY);

    // Red glow
    circle(xPos, yPos, starEdge, "red");

    // Shooting star
    ctx.lineWidth = 5;
    ctx.strokeStyle = "orange";
    ctx.fillStyle = "yellow";

    ctx.beginPath();
    ctx.arc(xPos, yPos, starSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

// Animate
xPos -= 3;
yPos += 3;
starSize += 0.7;
starEdge += 0.7;

// Restart when it leaves the screen
if (xPos < -150 || yPos > 550) {
    xPos = 500;
    yPos = -50;

    starSize = 8;
    starEdge = 12;
}

    requestAnimationFrame(draw);
}

draw();
