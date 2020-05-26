var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
const radius = 15
const quarantineStart = 500
let numInQuarantine = 0
let quarantineMax = 7
let quarantineFull=false

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Person {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id
        this.contacts = {}
        this.color = 'red'
        this.isMoving = true
    }

    //draw projectile
    draw() {
        theContext.beginPath();
        theContext.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        theContext.fillStyle = this.color;
        theContext.fill();
    }

    //move projectile
    move() {
        if (this.isMoving) {
            this.x += getRndInteger(-10, 10);
            this.y += getRndInteger(-10, 10);
            if (this.x < radius) {
                this.x = radius;
            } else if (this.x > quarantineStart - radius) {
                this.x = quarantineStart - radius
            }

            if (this.y < radius) {
                this.y = radius;
            } else if (this.y > theCanvas.height - radius) {
                this.y = theCanvas.height - radius
            }
        }
        this.draw();
    }

    //log contact
    addContact(id) {
        //const key= String(id)
        if (this.contacts[id]) {
            this.contacts[id]++
        } else {
            this.contacts[id] = 1
        }
    }
}

function handleClick(event) {
    x = event.layerX
    y = event.layerY
    for (person of population) {
        if (x > person.x - radius && x < person.x + radius && y > person.y - radius && y < person.y + radius) {
            if (numInQuarantine < quarantineMax) {
                person.isMoving = false;
                person.x = quarantineStart + (numInQuarantine % 7) * 35 + 20
                person.y = Math.floor(numInQuarantine / 7) * 35 + 20
                person.color = 'blue'
                numInQuarantine++
            } else {
                quarantineFull=true
                window.setTimeout(()=>{quarantineFull=false},1000)
            }
        }

    }
}

const population = []
for (let i = 0; i < 10; i++) {
    population.push(new Person(i * 50 + 10, i * 50 + 10, i))
}

function findDist(person1, person2) {
    return Math.sqrt(Math.pow(person1.x - person2.x, 2) + Math.pow(person1.y - person2.y, 2))
}

function logContacts() {
    for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
            if (population[i].isMoving && population[j].isMoving && findDist(population[i], population[j]) <= 2 * radius) {
                population[i].addContact(j)
                population[j].addContact(i)
                console.log('contact made')
            }
        }
    }
}

function drawBackground() {
    theContext.beginPath()
    theContext.lineWidth = "5";
    theContext.strokeStyle = "green";
    theContext.moveTo(quarantineStart, 0)
    theContext.lineTo(quarantineStart, theCanvas.height)
    theContext.stroke()
    if (quarantineFull) {
        theContext.textAlign = 'center'
        theContext.fillStyle='red'
        theContext.font="50px Arial"
        theContext.fillText('Quarantine is full', 250, 250)
    }
}

function drawCanvas() {
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height)
    drawBackground()
    for (person of population) {
        person.move()
    }
    logContacts()
    theCanvas.onclick = handleClick
    window.setTimeout(drawCanvas, 1000 / 10)
}

drawCanvas()