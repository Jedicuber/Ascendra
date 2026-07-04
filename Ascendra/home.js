//going to try and make a animated fox icon with js
var y = 200;
var x = 200;

function setup() {
    createCanvas(400, 400);
}

function draw() {
    noStroke();
    background(255, 255, 0);

    // main head
    fill(165, 255, 0);
    ellipse(x, y, 250, 250);

    //ears
    triangle(110, 140, 110, 50, 165, 85)
}
