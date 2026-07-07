var xPos = 300;
var yPos = 100;
var starSize = 0;
var stars = 5;
var starEdge = 8;
var mediumStar = 8;
var largeStars = 13;
var starStroke = largeStars + 4;
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
    fill(242, 241, 153);
    ellipse(50, 50, mediumStar, mediumStar);
    ellipse(244, 70, mediumStar, mediumStar);
    ellipse(117, 168, mediumStar, mediumStar);
    ellipse(270, 365, mediumStar, mediumStar);
    ellipse(300, 201, mediumStar, mediumStar);
    ellipse(230, 271, mediumStar, mediumStar);
    ellipse(81, 336, mediumStar, mediumStar);
    
    //large stars
    fill(255, 165, 0);
    ellipse(47, 149, starStroke, starStroke);
    fill(255, 255, 0);
    ellipse(47, 149, largeStars, largeStars);
    
    //edge of star
    fill(255, 0, 0);
    ellipse(xPos, yPos, starEdge, starEdge);
    
    //shooting star
    strokeWeight(5);
    stroke(255 ,165 , 0);
    fill(255, 255, 0);
    ellipse(xPos, yPos, starSize, starSize);
    
    //animation
    xPos -= 3;
    yPos += 3;
    starSize += 0.7;
    starEdge += 0.7;
};
