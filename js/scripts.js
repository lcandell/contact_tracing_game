document.getElementById("infectValue").innerHTML = document.getElementById("infect").value;
document.getElementById("periodValue").innerHTML = document.getElementById("period").value;
document.getElementById("testingValue").innerHTML = document.getElementById("testing").value;
document.getElementById("interactRate").innerHTML = document.getElementById("rate").value;

let theCanvas = document.getElementById("theCanvas");
let theContext = theCanvas.getContext("2d");
let graph = document.getElementById("graph")
let graphContext = graph.getContext("2d")
const radius = 12
const fps = 10
const quarantineStart = 500
let infectChance = document.getElementById("infect").value
let testChance = document.getElementById("testing").value
let infectTime = document.getElementById("period").value * fps
let quarantineFull = false
const quarantineSpots = []
let speed = document.getElementById("rate").value
let time = 0
let day = 1
const todayInfects = {
    tested: 0,
    untested: 0
}

let dailyInfects = [{
    tested: 0,
    untested: 2
}]




for (let i = 0; i < 14; i++) {
    quarantineSpots.push({
        x: quarantineStart + (i % 7) * 35 + 20,
        y: Math.floor(i / 7) * 35 + 20,
        occupied: false
    })
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateInfection(value) {
    infectChance = document.getElementById("infect").value
    document.getElementById("infectValue").innerHTML = infectChance
}

function updatePeriod(value) {
    infectTime = document.getElementById("period").value * fps
    document.getElementById("periodValue").innerHTML = document.getElementById("period").value
}

function updateTest(value) {
    testChance = document.getElementById("testing").value
    document.getElementById("testingValue").innerHTML = testChance
}

function updateRate(value) {
    speed = document.getElementById("rate").value
    document.getElementById("interactRate").innerHTML = speed
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
    let rect = theCanvas.getBoundingClientRect()
    let x = event.clientX - rect.x
    let y = event.clientY - rect.y
    for (person of population) {
        if (x > person.x - radius && x < person.x + radius && y > person.y - radius && y < person.y + radius) {
            quarantinePers(person)
        }

    }
    console.log(event)
    console.log(x + ", " + y)
    console.log(infectChance)
}

function ballCollision(person1, person2) {
    let dist = findDist(person1, person2)

    if (dist < 2 * radius) {
        let theta1 = person1.angle;
        let theta2 = person2.angle;
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

        if (person1.speed < speed - .1 || person1.speed > speed + .1) {
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
        let tested = Math.random()
        if (person1.infectionTime && !person2.infectionTime) {
            person2.infectionTime = infectTime;
            if (tested < testChance) {
                person2.tested = true
                todayInfects.tested++
            } else {
                todayInfects.untested++
            }
        } else if (person2.infectionTime && !person1.infectionTime) {
            person1.infectionTime = infectTime;
            if (tested < testChance) {
                person1.tested = true
                todayInfects.tested++
            } else {
                todayInfects.untested++
            }
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

function incrementTime() {
    time++
    if (time % (fps*1.5) === 0) {
        day++
        if (dailyInfects.length<100) {
            dailyInfects.push({ ...todayInfects })
        }
        todayInfects.tested = 0
        todayInfects.untested = 0
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
    theContext.textAlign = 'center'
    theContext.fillStyle = 'red'
    theContext.font = "25px Arial"
    theContext.fillText(day, 600, 400)
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
    for (spot of quarantineSpots) {
        spot.occupied = false
    }
    time = 0
    day = 1
    dailyInfects = [{ tested: 0, untested: 2 }]
    todayInfects.tested = 0
    todayInfects.untested = 0
}

function drawGraph() {
    graphContext.clearRect(0, 0, graph.width, graph.height)
    let dayWidth = (graph.width - 10) / dailyInfects.length
    let infectHeight = (graph.height - 10) / 15
    for (let i = 0; i < dailyInfects.length; i++) {
        graphContext.fillStyle='red'
        graphContext.fillRect(
            7 + (i * dayWidth),
            graph.height - 5 - (dailyInfects[i].tested * infectHeight),
            dayWidth,
            (dailyInfects[i].tested * infectHeight)
        )
        graphContext.fillStyle='#ffa5a5'
        graphContext.fillRect(
            7 + (i * dayWidth),
            graph.height - 5 - (dailyInfects[i].tested * infectHeight)-(dailyInfects[i].untested*infectHeight),
            dayWidth,
            (dailyInfects[i].untested * infectHeight)
        )
    }
    graphContext.beginPath()
    graphContext.lineWidth = "1";
    graphContext.strokeStyle = "green";
    graphContext.moveTo(5, 0)
    graphContext.lineTo(5, graph.height)
    graphContext.stroke()
    graphContext.beginPath()
    graphContext.moveTo(0, graph.height - 5)
    graphContext.lineTo(graph.width, graph.height - 5)
    graphContext.stroke()
}

function drawCanvas() {

    drawBackground()
    for (person of population) {
        person.move()
    }
    drawGraph()
    logContacts()
    incrementTime()
    window.setTimeout(drawCanvas, 1000 / fps)
}

let population = []
reset()
theCanvas.onclick = handleClick
document.getElementById('resetButton').onclick = reset
drawCanvas()
