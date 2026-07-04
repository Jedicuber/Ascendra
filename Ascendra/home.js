var x = 200;
var y = 200;

function setup() {
    createCanvas(400, 400);
}

function draw() {
    background(255, 255, 0);
    noStroke();

    // HEAD
    fill(255, 140, 0);
    ellipse(x, y, 250, 250);

    // EARS (orange triangles)
    fill(255, 140, 0);

    triangle(x - 90, y - 60, x - 140, y - 170, x - 40, y - 120);
    triangle(x + 90, y - 60, x + 140, y - 170, x + 40, y - 120);

    // EYES
    fill(0);
    ellipse(x - 40, y - 10, 20, 20);
    ellipse(x + 40, y - 10, 20, 20);

    // NOSE
    triangle(x, y + 20,
             x - 10, y + 40,
             x + 10, y + 40);

    // MUZZLE (white snout area)
    fill(255);
    ellipse(x, y + 50, 120, 80);
}
