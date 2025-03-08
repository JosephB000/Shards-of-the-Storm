const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//sprite size = 160 x 160 pixels
const spriteSize = 160; 

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let runtime = 0;
let runtimeMillis = 0;

let bullets = [];
let enemies = [];
let bulletSpeed = 10;
const bulletLifespan = 3.5;

const Vector2 = class {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

const Bullet = class {
    constructor(pos, vel){
        this.pos = pos;
        this.vel = vel;
        this.timeAlive = runtime;
    }
}

const Enemy = class {
    constructor(pos, vel, health){
        this.pos = pos;
        this.vel = vel;
        this.health = health;
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

    newVel = new Vector2(dX / dLength, dY / dLength);
    newBullet = new Bullet(new Vector2(player.pos.x, player.pos.y), newVel);
    bullets.push(newBullet);
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

function drawScreen(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw player
    ctx.fillStyle = "#7E6B8F";
    ctx.fillRect(player.pos.x - (player.width / 2), player.pos.y - (player.height / 2), player.width, player.height);

    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        
        if(runtime - b.timeAlive >= bulletLifespan){
            bullets.splice(i, i-1);
        }

        b.pos.x += b.vel.x * bulletSpeed;
        b.pos.y += b.vel.y * bulletSpeed;
        ctx.fillStyle = "black";
        ctx.fillRect(b.pos.x, b.pos.y, 10, 10);
    }
}

function gameLoop(){
    runtimeMillis++;
    if(runtimeMillis === 1000){
        runtime++;
        runtimeMillis = 0;
    }

    movePlayer();
    drawScreen();
}

document.getElementById("canvas").onwheel = function(event){
    event.preventDefault();
};

document.getElementById("canvas").onmousewheel = function(event){
    event.preventDefault();
};

setInterval(() => {gameLoop()}, 1); 
