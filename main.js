const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//sprite size = 160 x 160 pixels
const spriteSize = 160; 

const playerImg = new Image();
const playerImgDir = "/images/player sprites/";
const playerImages = {
    front: playerImgDir + "playerFront.png",
    back: playerImgDir + "playerBack.png",
    left: playerImgDir + "playerLeft.png",
    right: playerImgDir + "playerRight.png"

}

const grassImg = new Image();
grassImg.src = "/images/other/grass.png";

playerImg.src = playerImages.front;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Vector2 = class {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

let player = {
    pos: new Vector2(10, 10),
    vel: new Vector2(0, 0),
    width: 160,
    height: 160,
    moveSpeed: 2.5
}

const grass = {
    pos: new Vector2(500, 500)
}

function movePlayer(){
    
    if (player.vel.x > 0) {
        playerImg.src = playerImages.right;
    }
    else if (player.vel.x < 0) {
        playerImg.src = playerImages.left;
    }
    else if (player.vel.y < 0) {
        playerImg.src = playerImages.back;
    }
    else if (player.vel.y > 0) {
        playerImg.src = playerImages.front;
    }

    player.pos.x += player.vel.x;
    player.pos.y += player.vel.y;
}

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
    ctx.drawImage(playerImg, 
        player.pos.x + (player.width / 2), 
        player.pos.y + (player.height / 2), player.width, 
        player.height)

    //draw grass
    ctx.drawImage(grassImg, grass.pos.x + (spriteSize / 2), grass.pos.y + (spriteSize / 2));
}

function collisionCheck(){
    //grass
    
}

function gameLoop(){
    movePlayer();
    drawScreen();
    collisionCheck();
}

setInterval(() => {gameLoop()}, .5); 
