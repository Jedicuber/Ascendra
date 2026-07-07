const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Make the canvas fill the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    backgroundStars = [];

    for (let i = 0; i < 120; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 2,
            color: Math.random() < 0.8
                ? "white"
                : (Math.random() < 0.5 ? "rgb(242,241,153)" : "yellow")
        });
    }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Original variables
let xPos = 300;
let yPos = 100;
let starSize = 0;
let stars = 5;
let starEdge = 8;
let mediumStar = 8;
let largeStars = 13;
let starStroke = largeStars + 4;

// Draw a circle
function circle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {

    // Black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Keep the original 400x400 drawing centered
    ctx.save();

    const offsetX = (canvas.width - 400) / 2;
    const offsetY = (canvas.height - 400) / 2;
    ctx.translate(offsetX, offsetY);

    // Small stars
    circle(85, 100, stars, "white");
    circle(200, 150, stars, "white");
    circle(350, 50, stars, "white");
    circle(313, 300, stars, "white");
    circle(70, 242, stars, "white");
    circle(362, 200, stars, "white");
    circle(200, 340, stars, "white");
    circle(165, 29, stars, "white");

    // Medium stars
    circle(50, 50, mediumStar, "rgb(242,241,153)");
    circle(244, 70, mediumStar, "rgb(242,241,153)");
    circle(117, 168, mediumStar, "rgb(242,241,153)");
    circle(270, 365, mediumStar, "rgb(242,241,153)");
    circle(300, 201, mediumStar, "rgb(242,241,153)");
    circle(230, 271, mediumStar, "rgb(242,241,153)");
    circle(81, 336, mediumStar, "rgb(242,241,153)");

    // Large glowing star
    circle(47, 149, starStroke, "orange");
    circle(47, 149, largeStars, "yellow");

    // Red outline
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

    // Animation
    xPos -= 3;
    yPos += 3;
    starSize += 0.7;
    starEdge += 0.7;

    requestAnimationFrame(draw);
}

draw();
