var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
const radius = 12
const quarantineStart = 500
let infectChance = .1
let infectTime = 400
let quarantineFull = false
const quarantineSpots = []
const speed=1.5

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
                let tempX = population[i].xVel//getRndInteger(-1, 1)
                let tempY = population[i].yVel//getRndInteger(-1, 1)
                population[i].xVel = population[j].xVel//tempX
                population[i].yVel = population[j].yVel//tempY
                population[j].xVel = tempX//-tempX
                population[j].yVel = tempY//-tempY
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

function reset() {
    population = []
    for (let i = 0; i < 100; i++) {
        population.push(new Person(
            10+radius+50*(i%10),
            10+radius+50*Math.floor(i/10),
            getRndInteger(1,360),
            i)
        )
    }
    for(let i=0;i<2;i++){
        population[getRndInteger(0,99)].infectionTime = infectTime
    }
}

function drawCanvas() {

    drawBackground()
    for (person of population) {
        person.move()
    }
    logContacts()
    window.setTimeout(drawCanvas, 1000 / 30)
}

let population = []
reset()
theCanvas.onclick = handleClick
document.getElementById('resetButton').onclick=reset
drawCanvas()