document.getElementById("infectValue").innerHTML = document.getElementById("infect").value;
document.getElementById("periodValue").innerHTML = document.getElementById("period").value;
document.getElementById("testingValue").innerHTML = document.getElementById("testing").value;
document.getElementById("interactRate").innerHTML = document.getElementById("rate").value;
document.getElementById("testInt").innerHTML = document.getElementById("testPer").value;

let theCanvas = document.getElementById("theCanvas");
let theContext = theCanvas.getContext("2d");
let graph = document.getElementById("graph")
let graphContext = graph.getContext("2d")
let testInterval = parseInt(document.getElementById("testPer").value)
let doTesting = (testInterval > 0)
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

for (let i = 0; i < 42; i++) {
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

function updateTestPer(value) {
    testInterval = parseInt(document.getElementById("testPer").value);
    doTesting = (testInterval > 0);
    document.getElementById("testInt").innerHTML = doTesting ? testInterval : "Off";
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
    //console.log(event)
    //console.log(x + ", " + y)
    //console.log(infectChance)
}

function ballCollision(person1, person2) {
    let dist = findDist(person1, person2)

    if (dist < 2 * radius) {
        let theta1 = person1.angle;
        let theta2 = person2.angle;
        let phi = Math.atan2(person2.y - person1.y, person2.x - person1.x);
        let v1 = person1.speed
        let v2 = person2.speed

        let dx1F = Math.cos(theta2 - phi) * Math.cos(phi) + Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
        let dy1F = Math.cos(theta2 - phi) * Math.sin(phi) + Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);
        let dx2F = Math.cos(theta1 - phi) * Math.cos(phi) + Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
        let dy2F = Math.cos(theta1 - phi) * Math.sin(phi) + Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);

        person1.xVel = dx1F*v1/Math.sqrt(dx1F*dx1F+dy1F*dy1F);
        person1.yVel = dy1F*v1/Math.sqrt(dx1F*dx1F+dy1F*dy1F);
        person2.xVel = dx2F*v2/Math.sqrt(dx2F*dx2F+dy2F*dy2F);
        person2.yVel = dy2F*v2/Math.sqrt(dx2F*dx2F+dy2F*dy2F);

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

function testPeople() {
    for (let i = day % testInterval; i < population.length; i += testInterval) {
        if (population[i].infectionTime > 0) {
            population[i].tested = true
            if (!population[i].quarantinePos) {
                quarantinePers(population[i])
            }
        }
    }
}

function incrementTime() {
    time++
    if (time % (fps) === 0) {
        day++
        if (doTesting) {
            testPeople()
        }
        if (infectChart.data.labels.length < 365) {
            infectChart.data.labels.push(day)
            infectChart.data.datasets[0].data.push(todayInfects.tested)
            infectChart.data.datasets[1].data.push(todayInfects.untested)
            infectChart.update()
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
    let ss = getRndInteger(0,99);
    population[ss].xVel *=10
    population[ss].yVel *=10
    


    for (let i = 0; i < 2; i++) {
        population[getRndInteger(0, 99)].infectionTime = infectTime
    }
    for (spot of quarantineSpots) {
        spot.occupied = false
    }
    time = 0
    day = 0
    infectChart.data.labels=[day]
    infectChart.data.datasets[0].data=[0]
    infectChart.data.datasets[1].data=[2]
    infectChart.update()
    todayInfects.tested = 0
    todayInfects.untested = 0
}


function drawCanvas() {

    drawBackground()
    for (person of population) {
        person.move()
    }
    logContacts()
    incrementTime()
    window.setTimeout(drawCanvas, 1000 / fps)
}

let population = []
reset()
theCanvas.onclick = handleClick
document.getElementById('resetButton').onclick = reset
drawCanvas()
