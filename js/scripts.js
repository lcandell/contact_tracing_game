var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
theContext.beginPath();
theContext.arc(300, 50, 5, 0, 2*Math.PI);
theContext.fillStyle = "blue";
theContext.fill();
var x = 300;
var y = 50;

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

class Person {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.contacts = []
    }
    // Getter
    get area() {
      return this.calcArea();
    }
    // Method
    calcArea() {
      return this.height * this.width;
    }
  }


function drawProjectile() {
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
    theContext.beginPath();
    theContext.arc(x, y, 5, 0, 2*Math.PI);
    theContext.fillStyle = "red";
    theContext.fill();
}

function moveProjectile() {
    x += getRndInteger(-10, 10);
    y += getRndInteger(-10, 10);
    if(x < 0){
        x = 0;
    } else if (x > theCanvas.width) {
        x = theCanvas.width
    }

    if(y < 0){
        y = 0;
    } else if (y > theCanvas.height) {
        y = theCanvas.height
    }
    
    drawProjectile();
    window.setTimeout(moveProjectile, 1000/30);
}


moveProjectile();