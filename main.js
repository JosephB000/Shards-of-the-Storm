// color palette: https://coolors.co/201e1f-ff4000-4381c1-feefdd-50b2c0

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bullets = [];
let enemies = [];
let bulletSpeed = 10;
const bulletLifespan = 3;

let runtime = 0;


const Vector2 = class {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

const Bullet = class {
    constructor(pos, vel, size, damage){
        this.pos = pos;
        this.vel = vel;
        this.size = size;
        this.damage = damage;
        this.timeAlive = runtime;
    }
}

const enemyTypes = {
    "speedster": {speed: 1.7, health: 2, size: 40, cooldown: 0, damage: 1},
    "ninja": {speed: 1, health: 3, size: 50, cooldown: 3, damage: 1},
    "tank": {speed: .7, health: 5, size: 65, cooldown: 0, damage: 1}
}

const Enemy = class {
    constructor(pos, vel, type){
        this.pos = pos;
        this.vel = vel;
        this.type = type;
        this.health = enemyTypes[type].health;
        this.size = enemyTypes[type].size;
        this.speed = enemyTypes[type].speed;
        this.damage = enemyTypes[type].damage;
        //saves the last time the ability of the type was used
        //defaulted to time the enemy is first spawned + cooldown 
        this.previousRuntime = 0;
    }
}

let player = {
    pos: new Vector2(100, 100),
    vel: new Vector2(0, 0),
    width: 50,
    height: 50,
    moveSpeed: 2.5,
    health: 10
}

function movePlayer(){
    if((player.pos.x + (player.width / 2)) + player.vel.x <= canvas.width && (player.pos.x - (player.width / 2)) + player.vel.x >= 0){
        player.pos.x += player.vel.x;
    }
    if((player.pos.y + (player.height / 2)) + player.vel.y <= canvas.height && (player.pos.y - (player.height / 2)) + player.vel.y >= 0){
        player.pos.y += player.vel.y;
    }
}

function shoot(mousePos){
    let dX = mousePos.x - player.pos.x;
    let dY = mousePos.y - player.pos.y;

    let dLength = Math.sqrt(dX ** 2 + dY ** 2);

    let damage = 1
    newVel = new Vector2(dX / dLength, dY / dLength);
    newBullet = new Bullet(new Vector2(player.pos.x, player.pos.y), newVel, 10, damage);
    bullets.push(newBullet);
}

function drawEnemy(enemy){
    if(enemy.type === "speedster"){
        //speedster
        ctx.fillStyle = "#4381C1";
        ctx.fillRect(enemy.pos.x - (enemy.size / 2), enemy.pos.y - (enemy.size / 2), enemy.size, enemy.size);
    }
    else if(enemy.type === "ninja"){
        //ninja
        ctx.fillStyle = "#201E1F";
        ctx.fillRect(enemy.pos.x - (enemy.size / 2), enemy.pos.y - (enemy.size / 2), enemy.size, enemy.size);
        ctx.fillStyle = "#FEEFDD";
        ctx.fillRect(enemy.pos.x - (enemy.size / 2) * .8, enemy.pos.y - (enemy.size / 2) * .8, enemy.size*0.8, enemy.size*.4);
    }
    else{
        //tank
        ctx.fillStyle = "#FF4000";
        ctx.fillRect(enemy.pos.x - (enemy.size / 2), enemy.pos.y - (enemy.size / 2), enemy.size, enemy.size);
    }
    
}

function moveEnemy(enemy){
    enemy.vel.x = Math.sign(player.pos.x - enemy.pos.x) * enemy.speed;
    enemy.vel.y = Math.sign(player.pos.y - enemy.pos.y) * enemy.speed;

    enemy.pos.x += enemy.vel.x;
    enemy.pos.y += enemy.vel.y;
}

canvas.addEventListener("click", (event) => {
    shoot(new Vector2(event.pageX, event.pageY));
})

document.addEventListener("keydown", (event) => {
    if(event.key == "w" && player.pos.y < canvas.height){
        player.vel.y = -player.moveSpeed;
    }
    else if(event.key == "s"){
        player.vel.y = player.moveSpeed;
    }
    else if(event.key == "a"){
        player.vel.x = -player.moveSpeed;
    }
    else if(event.key == "d"){
        player.vel.x = player.moveSpeed;
    }

})

document.addEventListener("keyup", (event) => {
    if(event.key == "w" && player.pos.y < canvas.height){
        player.vel.y = 0;
    }
    else if(event.key == "s"){
        player.vel.y = 0;
    }
    else if(event.key == "a"){
        player.vel.x = 0;
    }
    else if(event.key == "d"){
        player.vel.x = 0;
    }
})

function countSeconds(){
    let timeoutId = setTimeout(() => {
        runtime++;
        clearTimeout(timeoutId);
        countSeconds();
    }, 1000);
}


function gameLoop(){
    

    let bulletsToDelete = [];
    let enemiesToDelete = [];

    movePlayer();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        
        if(runtime - b.timeAlive >= bulletLifespan){
            bulletsToDelete.push(i);
        }

        b.pos.x += b.vel.x * bulletSpeed;
        b.pos.y += b.vel.y * bulletSpeed;

        ctx.fillStyle = "black";
        ctx.fillRect(b.pos.x - (b.size / 2), b.pos.y - (b.size / 2), 10, 10);
    }

    //draw player
    ctx.fillStyle = "#50B2C0";
    ctx.fillRect(player.pos.x - (player.width / 2), player.pos.y - (player.height / 2), player.width, player.height);

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        drawEnemy(enemy);
        moveEnemy(enemy);

        if(enemy.type === "ninja"){
            if(runtime - enemyTypes[enemy.type].cooldown >= enemy.previousRuntime){
                console.log("dashed");
                //cooldown over, use ability
                let dX = player.pos.x - enemy.pos.x;
                let dY = player.pos.y - enemy.pos.y;
                let dLength = Math.sqrt(dX ** 2 + dY ** 2);

                newVel = new Vector2(dX / dLength, dY / dLength);
                enemy.pos.x += newVel.x * 100;
                enemy.pos.y += newVel.y * 100;
                enemy.previousRuntime = runtime;
                
            }
        }

        for (let j = 0; j < bullets.length; j++) {
            let b = bullets[j];
            if(b.pos.x - (b.size / 2) <= enemy.pos.x + (enemy.size / 2) && b.pos.x + (b.size / 2) >= enemy.pos.x - (enemy.size / 2)){
                if(b.pos.y - (b.size / 2) <= enemy.pos.y + (enemy.size / 2) && b.pos.y + (b.size / 2) >= enemy.pos.y - (enemy.size / 2)){
                    //bullet hit enemy
                    enemy.health -= b.damage;
                    bulletsToDelete.push(j);
                    if(enemy.health === 0){
                        enemiesToDelete.push(i);
                    }
                }
            }
        }
        
    }

    let enemiesRemoved = 0;
    let bulletsRemoved = 0;
    bulletsToDelete.sort();
    enemiesToDelete.sort();
    //remove bullets needing to be removed from array 
    for (let i = 0; i < bulletsToDelete.length; i++) {
        //since there are 2 instances where bullets can be deleted, check for repeats
        for (let j = 0; j < bulletsToDelete.length; j++) {
            if (bulletsToDelete[i] === bulletsToDelete[j]){
                bulletsToDelete.splice(j, j-1);
            }
        }
    }
    //remove all bullets from list with no repeats
    for (let i = 0; i < bulletsToDelete.length; i++) {
        bullets.splice(bulletsToDelete[i] - bulletsRemoved, 1);
        bulletsRemoved++;
    }
    
    for (let i = 0; i < enemiesToDelete.length; i++){
        enemies.splice(enemiesToDelete[i] - enemiesRemoved, 1);
        enemiesRemoved++;
    }
}

document.getElementById("canvas").onwheel = function(event){
    event.preventDefault();
};

document.getElementById("canvas").onmousewheel = function(event){
    event.preventDefault();
};

enemies.push(new Enemy(new Vector2(50, 300), new Vector2(0, 0), "speedster"));
enemies.push(new Enemy(new Vector2(300, 300), new Vector2(0, 0), "ninja"));
enemies.push(new Enemy(new Vector2(500, 300), new Vector2(0, 0), "tank"));

countSeconds();
setInterval(() => {gameLoop()}); 
