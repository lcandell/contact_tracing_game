var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
theContext.beginPath();
theContext.arc(300, 50, 5, 0, 2 * Math.PI);
theContext.fillStyle = "blue";
theContext.fill();
var x = 300;
var y = 50;
const radius=50

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Person {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.contacts = {}
    }

    //draw projectile
    draw() {
        theContext.beginPath();
        theContext.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        theContext.fillStyle = "red";
        theContext.fill();
    }

    //move projectile
    move() {
        this.x += getRndInteger(-10, 10);
        this.y += getRndInteger(-10, 10);
        if (this.x < radius) {
            this.x = radius;
        } else if (this.x > theCanvas.width-radius) {
            this.x = theCanvas.width-radius
        }

        if (this.y < radius) {
            this.y = radius;
        } else if (this.y > theCanvas.height-radius) {
            this.y = theCanvas.height-radius
        }
        this.draw();
    }

    //log contact
    addContact(id){
        //const key= String(id)
        if(this.contacts[id]){
            this.contacts[id]++
        }else{
            this.contacts[id]=1
        }
    }
}

const population = []
population.push(new Person(100,100))
population.push(new Person(200,200))

function findDist(person1,person2){
    return Math.sqrt(Math.pow(person1.x-person2.x,2)+Math.pow(person1.y-person2.y,2))
}

function logContacts(){
    for(let i=0;i<population.length;i++){
        for(let j=i+1;j<population.length;j++){
            if(findDist(population[i],population[j])<=2*radius){
                population[i].addContact(j)
                population[j].addContact(i)
                console.log('contact made')
            }
        }
    }
}


function drawCanvas(){
    theContext.clearRect(0,0,theCanvas.width,theCanvas.height)
    for(person of population){
        person.move()
    }
    logContacts()
    window.setTimeout(drawCanvas,1000/30)
}

drawCanvas()