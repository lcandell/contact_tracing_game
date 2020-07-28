#Python code to iterate on Agent Based Model implemented in game

import math,random


radius = 12
gridsize = 500
sps = 10

N=100
infHist=[0]*101
infPer=20
infProb=0.5
speed=.8
people={}
infected={}

def dst(p1,p2):
    return math.sqrt((p1['x']-p2['x'])**2+(p1['y']-p2['y'])**2)

def move(person):
    person['x']+=speed*math.cos(person['ang'])
    person['y']+=speed*math.sin(person['ang'])
    if person['id']==spreader:
        person['x']+=9*speed*math.cos(person['ang'])
        person['y']+=9*speed*math.sin(person['ang'])
    
    if person['x']<radius:
        if math.cos(person['ang'])<0:
            person['ang'] = math.pi - person['ang']
    elif person['x']+radius>gridsize:
        if math.cos(person['ang'])>0:
            person['ang'] = math.pi - person['ang']
    
    if person['y']<radius:
        if math.sin(person['ang'])<0:
            person['ang'] = -person['ang']
    if person['y']+radius>gridsize:
        if math.sin(person['ang'])>0:
            person['ang'] = -person['ang']
            
def ballCollision(person1, person2):
    dist = dst(person1,person2)

    if (dist < 2 * radius) and person1['id']<person2['id']:
        #if person1['id']==0 or person2['id']==0:
         #   print 'Coll',person1,person2
        theta1 = person1['ang']
        theta2 = person2['ang']
        phi = math.atan2(person2['y'] - person1['y'], person2['x'] - person1['x'])
        v = speed

        dx1F =  math.cos(theta2 - phi) * math.cos(phi) + math.sin(theta1 - phi) * math.cos(phi + math.pi / 2)
        dy1F =  math.cos(theta2 - phi) * math.sin(phi) + math.sin(theta1 - phi) * math.sin(phi + math.pi / 2)
        dx2F =  math.cos(theta1 - phi) * math.cos(phi) + math.sin(theta2 - phi) * math.cos(phi + math.pi / 2)
        dy2F =  math.cos(theta1 - phi) * math.sin(phi) + math.sin(theta2 - phi) * math.sin(phi + math.pi / 2)

        person1['ang']=math.atan2(dy1F,dx1F)
        person2['ang']=math.atan2(dy2F,dx2F)


        #staticCollision(person1, person2)

def infect(t):
    newinf=set()
    oldinf=set()
    for i in infected:
        if t<infected[i]['iTime']:
            for p in people:
                if dst(infected[i],people[p])<2*radius and random.random()<infProb:
                    newinf.add(p)
                    people[p]['iTime']=t+infPer*sps
                    infHist[t/sps+1]+=1
        else:
            oldinf.add(i)
    for n in newinf:
        infected[n]=people[n]
        del people[n]
    for o in oldinf:
        del infected[o]	


for it in range(N):
    print it
    people={j:{'id':j,'iTime':0.0, 'x':(j%10)*50+22,'y':(j/10)*50+22,'ang':random.randrange(360)*math.pi/180} for j in range(100)}
    infected = {}
    i1=random.randrange(100)
    i2=i1
    while i2==i1:
        i2 = random.randrange(100)
    infected[i1]=people[i1]
    infected[i1]['iTime']=infPer*sps
    infected[i2]=people[i2]
    infected[i2]['iTime']=infPer*sps
    del people[i1]
    del people[i2]
    infHist[0]+=2
    spreader =random.randrange(100)
    t=0
    while t<100*sps and len(infected)>0:
        #print t,len(infected)
        for p in people:
            move(people[p])
        for i in infected:
            move(infected[i])
        infect(t)
        for p1 in people:
            for p2 in people:
                if p1!=p2:
                    ballCollision(people[p1],people[p2])
        for i1 in infected:
            for i2 in infected:
                if i1!=i2:
                    ballCollision(infected[i1],infected[i2])
        for p in people:
            for i in infected:
                    ballCollision(people[p],infected[i])
        t+=1
                    
for k in range(100):
    print k,infHist[k]/float(N)
