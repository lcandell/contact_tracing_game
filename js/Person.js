class Person {
    constructor(x, y, angle,id) {
        this.x = x;
        this.y = y;
        this.xVel = Math.cos(angle*Math.PI/180)
        this.yVel = Math.sin(angle*Math.PI/180)
        //this.id = id  ...now is the key in the population object
        this.contacts = {}
        this.color = 'red'
        this.isMoving = true
        this.infectionTime = 0
        this.quarantinePos = false
        this.tested = false
        this.contacted = false
        this.speed = 1
    }

    get angle(){
        return Math.atan2(this.yVel, this.xVel)
    }


    //draw projectile
    draw() {
        if (this.tested) {
            this.color = 'red'
        } else if (this.contacted) {
            this.color = 'yellow'
        }    
        else {
            this.color = '#7da7ab'
        }
        theContext.beginPath();
        theContext.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        theContext.fillStyle = this.color;
        theContext.fill();
    }

    //move projectile
    move() {
        if (this.isMoving) {
            this.x += speed*this.speed*this.xVel;
            this.y += speed*this.speed*this.yVel;
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
    }

    //log contact
    addContact(id,time) {
        //const key= String(id)
        this.contacts[id]=time;
        //if (this.contacts[id]) {
        //    this.contacts[id]++
       // } else {
         //   this.contacts[id] = 1
       // }
    }

}

