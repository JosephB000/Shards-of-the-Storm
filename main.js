const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let runtime = 0;
let runtimeMillis = 0;

let bullets = [];
let enemies = [];
let bulletSpeed = 10;
const bulletLifespan = 3;

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

const Enemy = class {
    constructor(pos, vel, health, size){
        this.pos = pos;
        this.vel = vel;
        this.health = health;
        this.size = size;
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
    ctx.fillStyle = "#FF4000";
    ctx.fillRect(enemy.pos.x - (enemy.size / 2), enemy.pos.y - (enemy.size / 2), enemy.size, enemy.size);
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

function gameLoop(){
    let bulletsToDelete = [];
    let enemiesToDelete = [];

    runtimeMillis++;
    if(runtimeMillis === 1000){
        runtime++;
        runtimeMillis = 0;
    }

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

        enemy.pos.x += enemy.vel.x;
        enemy.pos.y += enemy.vel.y;

        drawEnemy(enemy);
        
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
        bullets.splice(bulletsToDelete[i] - bulletsRemoved);
    }
    
    for (let i = 0; i < enemiesToDelete.length; i++){
        enemies.splice(enemiesToDelete[i] - enemiesRemoved);
    }
}

document.getElementById("canvas").onwheel = function(event){
    event.preventDefault();
};

document.getElementById("canvas").onmousewheel = function(event){
    event.preventDefault();
};

enemies.push(new Enemy(new Vector2(300, 300), new Vector2(0, 0), 5, 50));

setInterval(() => {gameLoop()}, 1); 
