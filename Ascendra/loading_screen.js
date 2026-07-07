var xPos = 300;
var yPos = 100;
var starSize = 0;
var stars = 5;
var starEdge = 8;
draw = function() {
    noStroke();
    
    background(0, 0, 0);
    
    //edge of star
    fill(255, 0, 0);
    ellipse(xPos, yPos, starEdge, starEdge);
    
    //shooting star
    strokeWeight(5);
    stroke(255 ,165 , 0);
    fill(255, 255, 0);
    ellipse(xPos, yPos, starSize, starSize);
    
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
    
    //animation
    xPos -= 3;
    yPos += 3;
    starSize += 0.5;
    starEdge += 0.5;
};




