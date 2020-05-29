class Person {
    constructor(x, y, angle,id) {
        this.x = x;
        this.y = y;
        this.xVel = speed*Math.cos(angle*Math.PI/180)
        this.yVel = speed*Math.sin(angle*Math.PI/180)
        this.id = id
        this.contacts = {}
        this.color = 'red'
        this.isMoving = true
        this.infectionTime = 0
        this.quarantinePos = {}
    }

    get angle(){
        return Math.atan2(this.yVel, this.xVel)
    }

    get speed(){
        return Math.sqrt(Math.pow(this.xVel,2)+Math.pow(this.yVel,2))
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