var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
const radius = 12
const quarantineStart = 500
let infectChance = .1
let infectTime = 400
let quarantineFull = false
const quarantineSpots = []
const speed = 1.5

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
        }

    }
}

function ballCollision(person1, person2) {
    //for (let i=0; i<objArray.length-1; i++) {
    //for (let j=i+1; j<objArray.length; j++) {
    //let ob1 = objArray[i]
    //let ob2 = objArray[j]
    let dist = findDist(person1, person2)

    if (dist < 2 * radius) {
        let theta1 = person1.angle();
        let theta2 = person2.angle();
        let phi = Math.atan2(person2.y - person1.y, person2.x - person1.x);
        let m1 = radius
        let m2 = radius
        let v1 = speed
        let v2 = speed

        let dx1F = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2) * Math.cos(phi) + v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
        let dy1F = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2) * Math.sin(phi) + v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);
        let dx2F = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2) * Math.cos(phi) + v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
        let dy2F = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2) * Math.sin(phi) + v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);

        person1.xVel = dx1F;
        person1.yVel = dy1F;
        person2.xVel = dx2F;
        person2.yVel = dy2F;

        if (person1.speed < speed - .1 || person1.speed> speed + .1) {
            person1.xVel *= (speed / person1.speed)
            person1.yVel *= (speed / person1.speed)
        }
        if (person2.speed < speed - .1 || person2.speed > speed + .1) {
            person2.xVel *= (speed / person2.speed)
            person2.yVel *= (speed / person2.speed)
        }

        staticCollision(person1, person2)

    }
}

function staticCollision(person1, person2, emergency = false) {
    let overlap = 2 * radius - findDist(person1, person2);
    let smallerObject = person1;
    let biggerObject = person2;

    // When things go normally, this line does not execute.
    // "Emergency" is when staticCollision has run, but the collision
    // still hasn't been resolved. Which implies that one of the objects
    // is likely being jammed against a corner, so we must now move the OTHER one instead.
    // in other words: this line basically swaps the "little guy" role, because
    // the actual little guy can't be moved away due to being blocked by the wall.
    if (emergency) [smallerObject, biggerObject] = [biggerObject, smallerObject]

    let theta = Math.atan2((biggerObject.y - smallerObject.y), (biggerObject.x - smallerObject.x));
    smallerObject.x -= overlap * Math.cos(theta);
    smallerObject.y -= overlap * Math.sin(theta);

    if (findDist(person1, person2) < 2 * radius) {
        // we don't want to be stuck in an infinite emergency.
        // so if we have already run one emergency round; just ignore the problem.
        if (!emergency) staticCollision(person1, person2, true)
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
                ballCollision(population[i], population[j])
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
            10 + radius + 50 * (i % 10),
            10 + radius + 50 * Math.floor(i / 10),
            getRndInteger(1, 360),
            i)
        )
    }
    for (let i = 0; i < 2; i++) {
        population[getRndInteger(0, 99)].infectionTime = infectTime
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
document.getElementById('resetButton').onclick = reset
drawCanvas()