var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
const radius = 12
const quarantineStart = 500
let infectChance = .1
let infectTime = 400
let quarantineFull = false
const quarantineSpots = []
for (let i = 0; i < 7; i++) {
    quarantineSpots.push({
        x: quarantineStart + (i % 7) * 35 + 20,
        y: Math.floor(i / 7) * 35 + 20,
        occupied: false
    })
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Person {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.xVel = getRndInteger(-3, 3)
        this.yVel = getRndInteger(-3, 3)
        this.id = id
        this.contacts = {}
        this.color = 'red'
        this.isMoving = true
        this.infectionTime = 0
        this.quarantinePos = {}
    }

    //draw projectile
    draw() {
        if (this.infectionTime) {
            this.color = 'purple'
        } else {
            this.color = 'red'
        }
        theContext.beginPath();
        theContext.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        theContext.fillStyle = this.color;
        theContext.fill();
    }

    //move projectile
    move() {
        if (this.isMoving) {
            this.x += this.xVel;
            this.y += this.yVel;
            if (this.x < radius) {
                if (this.xVel < 0) {
                    this.xVel = -this.xVel
                }
            } else if (this.x > quarantineStart - radius) {
                if (this.xVel > 0) {
                    this.xVel = -this.xVel
                }
            }

            if (this.y < radius) {
                if (this.yVel < 0) {
                    this.yVel = -this.yVel
                }
            } else if (this.y > theCanvas.height - radius) {
                if (this.yVel > 0) {
                    this.yVel = -this.yVel
                }
            }
        }
        this.draw();
        if (this.infectionTime > 0) {
            this.infectionTime--
            if (this.infectionTime === 0) {
                this.remove()
            }
        }

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

    remove() {
        this.quarantinePos.occupied = false
        population = population.filter((pers) => {
            return pers.id !== this.id
        })
    }
}

function quarantinePers(person) {
    let full = true
    for (spot of quarantineSpots) {
        if (!spot.occupied) {
            person.x = spot.x
            person.y = spot.y
            person.isMoving = false
            person.quarantinePos = spot
            spot.occupied = true
            full = false

            break
        }
    }
    if (full) {
        quarantineFull = true
        window.setTimeout(() => { quarantineFull = false }, 1000)
    }
}

function handleClick(event) {
    x = event.layerX
    y = event.layerY
    for (person of population) {
        if (x > person.x - radius && x < person.x + radius && y > person.y - radius && y < person.y + radius) {
            quarantinePers(person)
            // if (numInQuarantine < quarantineMax) {
            //     person.isMoving = false;
            //     person.x = quarantineStart + (numInQuarantine % 7) * 35 + 20
            //     person.y = Math.floor(numInQuarantine / 7) * 35 + 20
            //     numInQuarantine++
            // } else {
            //     quarantineFull = true
            //     window.setTimeout(() => { quarantineFull = false }, 1000)
            // }
        }

    }
}

let population = []
for (let i = 0; i < 100; i++) {
    population.push(new Person(getRndInteger(radius, quarantineStart - radius),
        getRndInteger(radius, quarantineStart - radius),
        i))
}
population[0].infectionTime = infectTime
population[1].infectionTime = infectTime

function findDist(person1, person2) {
    return Math.sqrt(Math.pow(person1.x - person2.x, 2) + Math.pow(person1.y - person2.y, 2))
}

function infect(person1, person2) {
    let chance = Math.random()
    if (chance < infectChance) {
        if (person1.infectionTime && !person2.infectionTime) {
            person2.infectionTime = infectTime;
        } else if (person2.infectionTime && !person1.infectionTime) {
            person1.infectionTime = infectTime;
        }
    }
}

function logContacts() {
    for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
            if (population[i].isMoving && population[j].isMoving && findDist(population[i], population[j]) <= 2 * radius) {
                population[i].addContact(j)
                population[j].addContact(i)
                let tempX = population[i].xVel
                let tempY = population[i].yVel
                population[i].xVel = population[j].xVel
                population[i].yVel = population[j].yVel
                population[j].xVel = tempX
                population[j].yVel = tempY
                infect(population[i], population[j])
            }
        }
    }
}

function drawBackground() {
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height)
    theContext.beginPath()
    theContext.lineWidth = "5";
    theContext.strokeStyle = "green";
    theContext.moveTo(quarantineStart, 0)
    theContext.lineTo(quarantineStart, theCanvas.height)
    theContext.stroke()
    if (quarantineFull) {
        theContext.textAlign = 'center'
        theContext.fillStyle = 'red'
        theContext.font = "50px Arial"
        theContext.fillText('Quarantine is full', 250, 250)
    }
}

function drawCanvas() {
    drawBackground()
    for (person of population) {
        person.move()
    }
    logContacts()
    theCanvas.onclick = handleClick
    window.setTimeout(drawCanvas, 1000 / 30)
}

drawCanvas()