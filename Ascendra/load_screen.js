var direction = 1;
var xPos = 300;
var yPos = 100;
var starSize = 0;
var stars = 5;
var starEdge = 8;
var mediumStar = 8;
var largeStars = 13;
var largeStroke = 2;
var trail = [];
draw = function() {
    background(0, 0, 0);
    noStroke();
    
    //stars
    fill(255, 255, 255);
    ellipse(85, 100, stars, stars);
    ellipse(200, 150, stars, stars);
    ellipse(350, 50, stars, stars);
    ellipse(313, 300, stars, stars);
    ellipse(70, 242, stars, stars);
    ellipse(362, 200, stars, stars);
    ellipse(200, 340, stars, stars);
    ellipse(165, 29, stars, stars);
    
    //medium sized stars
    //yellow
    fill(255, 255, 0);
    ellipse(50, 50, mediumStar, mediumStar);
    
    //cyan
    fill(39, 237, 240);
    ellipse(244, 70, mediumStar, mediumStar);
    ellipse(117, 168, mediumStar, mediumStar);
    
    //yellow
    fill(255, 255, 0);
    ellipse(270, 365, mediumStar, mediumStar);
    ellipse(300, 201, mediumStar, mediumStar);
    ellipse(230, 271, mediumStar, mediumStar);
    
    //cyan
    fill(39, 237, 240);
    ellipse(81, 336, mediumStar, mediumStar);
    
    //large stars
    stroke(255, 165, 0);
    strokeWeight(2);
    fill(255, 255, 0);
    ellipse(47, 149, largeStars, largeStars);
    
    stroke(255, 165, 0);
    strokeWeight(2);
    fill(255, 255, 0);
    ellipse(330, 127, largeStars, largeStars);
    
    stroke(255, 165, 0);
    strokeWeight(2);
    fill(255, 255, 0);
    ellipse(159, 293, largeStars, largeStars);
    
    trail.push ({
        x: xPos,
        y: yPos
    });
    
    if (trail.length > 40) {
        trail.shift();
    }
    
    for (var i = 0; i < trail.length; i++) {
        fill(255, 255, 0, i*8);
    
        ellipse(
            trail[i].x,
            trail[i].y,
            (trail.length - i) / 2,
            (trail.length - i) / 2
        );
    }
    
    //shooting star
    strokeWeight(5);
    stroke(255, 165 , 0);
    fill(255, 255, 0);
    ellipse(xPos, yPos, starSize, starSize);
    
    //edge of star
    noStroke();
    
    fill(255, 0, 0);
    ellipse(xPos, yPos, starEdge, starEdge);
   
   //shooting star
    strokeWeight(5);
    stroke(255, 165 , 0);
    fill(255, 255, 0);
    ellipse(xPos, yPos, starSize, starSize);
    
    
    
    //animation
    
    xPos -= 3 * direction;
    yPos += 3 * direction;
    starSize += 1 * direction;
    starEdge += 1 * direction;
    
    if (xPos <= -70) {
        direction = -1;
    }

    if (xPos >= 340) {
        direction = 1;
    }
    
    if (starSize === 25) {
        starSize = 25;
    }

    if (starSize === 0) {
        starSize = 0;
    }
    for (var i = 0; i < trail.length; i++) {
        var trailSize = (trail.length - i) * (starSize / 15);
        fill(255, 255, 0, i * 8);
    }
};
