const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bullets = [];
let enemies = [];
let powerups = [];

const maxHealth = 10;

const maxAmmo = 30;
const fireRate = .1;
const reloadTime = 1.5;
let timeSinceReload = 0;
let reloaded = true;
let lastTimeShot = 0;

let mouseDown = false;
let mousePos;

let runtime = 0;

let wave = 1;
let lastSpawnedEnemy = 0;
let spawnRate = 1;
let enemiesSpawned = {speedster: 0, ninja: 0, tank: 0};

const elementInfectionDuration = 5;
const elementPlayerDuration = 10;

let lastTimePowerupSpawned = 0;
const powerupCooldown = 30;

const waveToSpawnNinja = 5;
const waveToSpawnTank = 10;

let gameOverState = false;

const enemyTypes = {
    "speedster": {speed: 2.7, health: 1, size: 40, cooldown: 0, damage: 1},
    "ninja": {speed: 2, health: 2, size: 50, cooldown: 1.5, damage: 2.5},
    "tank": {speed: 1.2, health: 4, size: 65, cooldown: 0, damage: 4}
}

const elementColors = {
    "fire": "red",
    "lightning": "yellow",
    "ice": "blue",
    "poison": "green"
}

const Vector2 = class {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    Normalize(){
        let z = Math.sqrt(this.x ** 2 + this.y ** 2);

        if(z > 0){
            return new Vector2(this.x / z, this.y / z);
        }
        return new Vector2(0, 0);
    }
}

const Bullet = class {
    constructor(pos, vel, size, damage){
        this.pos = pos;
        this.vel = vel;
        this.size = size;
        this.damage = damage;
        this.speed = 10;
        this.lifespan = 3;
        this.timeAlive = runtime;
    }
}

const Enemy = class {
    constructor(pos, vel, type){
        this.pos = pos;
        this.vel = vel;
        this.type = type;
        this.health = enemyTypes[this.type].health;
        this.size = enemyTypes[this.type].size;
        this.speed = enemyTypes[this.type].speed;
        this.damage = enemyTypes[this.type].damage;
        //saves the last time the ability of the type was used
        //defaulted to time the enemy is first spawned + cooldown 
        this.previousRuntime = 0;
        
        this.element = "";
        this.elementCooldown = 0;

        this.elementDuration = 0;
    }

    draw(){
        let sprite = new Image();
        sprite.src = "sprites/enemies/" + this.type + ".png";

        ctx.drawImage(sprite, this.pos.x - (this.size / 2), this.pos.y - (this.size / 2));
    
        if(this.element !== ""){
            if (this.element === "fire"){
                ctx.fillStyle = "rgb(255 0 0 / 50%)";
            }
            else if (this.element === "ice"){
                ctx.fillStyle = "rgb(0 0 255 / 50%)";
            }
            else if (this.element === "lightning"){
                ctx.fillStyle = "rgb(255 255 0 / 50%)";
            }
            else if (this.element === "poison"){
                ctx.fillStyle = "rgb(0 255 0 / 50%)";
            }
            ctx.fillRect(this.pos.x - (this.size / 2), this.pos.y - (this.size / 2), this.size, this.size);
            ctx.fillStyle = "rgb(0 0 0 / 100%)";
        }
        
    }

    move(){
        let d = new Vector2(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
        let newVel = d.Normalize();

        this.pos.x += newVel.x * this.speed;
        this.pos.y += newVel.y * this.speed;
    }
}

const Powerup = class {
    constructor(pos, element, color){
        this.pos = pos;
        this.element = element;
        this.color = color;
        this.size = 50;
    }

    draw(){
        

        if(this.element === "poison" || this.element === "fire"){
            let sprite = new Image();
            sprite.src = "sprites/powerups/" + this.element + ".png";
            ctx.drawImage(sprite, this.pos.x, this.pos.y);
        }
        else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.pos.x, this.pos.y, 50, 50);
        }
    }
}

const Player = class{
    constructor(){
        this.pos = new Vector2(canvas.width / 2, canvas.height / 2);
        this.vel = new Vector2(0, 0);
        this.size = 50;
        this.moveSpeed = 2.5;
        this.health = maxHealth;
        this.element = "";
        this.lastCollectedElement = 0;
        this.ammo = maxAmmo;
        this.damage = 1;
    }

    move(){
        this.vel = this.vel.Normalize();
        if((this.pos.x + (this.size / 2)) + this.vel.x <= canvas.width && (this.pos.x - (this.size / 2)) + this.vel.x >= 0){
            this.pos.x += this.vel.x * player.moveSpeed;
        }
        if((this.pos.y + (this.size / 2)) + this.vel.y <= canvas.height && (this.pos.y - (this.size / 2)) + this.vel.y >= 0){
            this.pos.y += this.vel.y * player.moveSpeed;
        }
    }

    draw(){
        let sprite = new Image();
        sprite.src = "sprites/maincharacter.png";

        ctx.drawImage(sprite, this.pos.x - (this.size / 2), this.pos.y - (this.size / 2));
    }

    shoot(mousePos){
        let d = new Vector2(mousePos.x - this.pos.x, mousePos.y - this.pos.y);
        let newVel = d.Normalize();
        let newBullet = new Bullet(new Vector2(this.pos.x, this.pos.y), newVel, 10, this.damage);
        bullets.push(newBullet);
    }
}

document.addEventListener("mousemove", (event) => {
    mousePos = new Vector2(event.clientX, event.clientY);
})

document.onmousedown = () => {
    mouseDown = true;
}

document.onmouseup = () => {
    mouseDown = false;
}

canvas.addEventListener("click", (event) => {
    lastTimeShot = runtime;
})

document.addEventListener("keydown", (event) => {
    if(event.key == "w"){
        player.vel.y = -1;
    }
    else if(event.key == "s"){
        player.vel.y = 1;
    }
    else if(event.key == "a"){
        player.vel.x = -1;
    }
    else if(event.key == "d"){
        player.vel.x = 1;
    }
    else if(event.key == "r"){
        if(player.ammo !== maxAmmo && reloaded){
            reloaded = false;
            timeSinceReload = runtime;
        }
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

function init(){
    mousePos = new Vector2(0, 0);
}

function countSeconds(){
    let timeoutId = setTimeout(() => {
        runtime+=.01;
        clearTimeout(timeoutId);
        countSeconds();
    }, 10);
}

function gameOver(){
    clearInterval(gameInterval);
    location.reload();
}

function spawnEnemy(speedstersToSpawn, ninjasToSpawn, tanksToSpawn){
    let enemyTypesLeftToSpawn = ["speedster", "ninja", "tank"];
    let enemiesToSplice = [];

    if(enemiesSpawned.speedster === speedstersToSpawn){
        enemiesToSplice.push(0);
    }
    if(enemiesSpawned.ninja === ninjasToSpawn){
        enemiesToSplice.push(1);
    }
    if(enemiesSpawned.tank === tanksToSpawn){
        enemiesToSplice.push(2);
    }

    //sort array
    enemiesToSplice.sort();

    for (let i = 0; i < enemiesToSplice.length; i++){
        enemyTypesLeftToSpawn.splice(enemiesToSplice[i] - i, 1);
    }
    
    //determines if they should spawn any where on the left/right or anywhere on the top/bottom
    let randPos;
    let j = Math.random();
    if(j <= .5){
        randPos = new Vector2(Math.round(Math.random()) * canvas.width, Math.random() * canvas.height);
    }
    else{
        randPos = new Vector2(Math.random() * canvas.width, Math.round(Math.random()) * canvas.height);
    }
    
    let typeToSpawn = Math.round(Math.random() * (enemyTypesLeftToSpawn.length - 1));

    enemies.push(new Enemy(randPos, new Vector2(0, 0), enemyTypesLeftToSpawn[typeToSpawn]));

    if(typeToSpawn === 0){
        enemyTypesLeftToSpawn.splice(0, 1);
        enemiesSpawned.speedster++;
    }
    else if(typeToSpawn === 1){
        enemyTypesLeftToSpawn.splice(1, 1);
        enemiesSpawned.ninja++;
    }
    else{
        enemyTypesLeftToSpawn.splice(2, 1);
        enemiesSpawned.tank++;
    }
    
    lastSpawnedEnemy = runtime;
}

function spawnPowerup(){
    const offset = 10; //powerups will spawn 10 px away from every border

    let pos = new Vector2(Math.random() * (canvas.width - offset) + offset, Math.random() * (canvas.height - offset) + offset);
    let element = "";
    let color = "";
    let r = Math.random();
    if(r <= .25){
        element = "fire";
    }
    else if(r <= .50){
        element = "lightning";
    }
    else if(r <= .75){
        element = "ice";
    }
    else{
        element = "poison";
    }

    color = elementColors[element];

    return new Powerup(pos, element, color);
}

function drawHUD(){
    //draw ammo
    let offset = 40;
    if (player.ammo > 0){
        ctx.fillStyle = "black";
        if(player.ammo >= 10){
            offset = 60;
        }
    }
    else{
        ctx.fillStyle = "red";
    }
    ctx.font = "48px serif";
    if(reloaded){
        ctx.fillText(player.ammo, 10, 50);
    }
    else{
        ctx.fillText("--", 10, 50);
    }
    ctx.fillStyle = "black";
    ctx.fillText("/" + maxAmmo, offset, 50);

    //draw element
    if(elementColors[player.element] !== undefined){
        ctx.fillStyle = elementColors[player.element];
        ctx.fillRect(70 + offset, 10, 50, 50);
    }
    
    

    //draw health
    ctx.fillStyle = "black";
    ctx.fillText(player.health + "/" + maxHealth + " Health", 10, 100);

    //draw wave
    ctx.fillStyle = "black";
    ctx.fillText("Wave: " + wave, canvas.width / 2, 50);
}

function gameLoop(){
    if (gameOverState){
        gameOver();
        return;
    }
    
    if(mouseDown && runtime > lastTimeShot + fireRate && player.ammo > 0 && reloaded){
        //if mouse is not over player
        if (!(mousePos.x > player.pos.x - (player.size / 2) && mousePos.x < player.pos.x + (player.size / 2) && mousePos.y > player.pos.y - (player.size / 2) && mousePos.y < player.pos.y + (player.size / 2))){
                mouseDown = true;
                player.shoot(mousePos);
                player.ammo--;
                lastTimeShot = runtime;
        }
        
    }

    let bulletsToDelete = [];
    let enemiesToDelete = [];
    let powerupsToDelete = [];

    player.move();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //auto reload
    if(player.ammo === 0 && reloaded){
        reloaded = false;
        timeSinceReload = runtime;
    }

    //complete reload after reload time
    if(!reloaded && runtime > timeSinceReload + reloadTime){
        player.ammo = maxAmmo;
        reloaded = true;
    }
    
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        
        if(runtime - b.timeAlive >= b.lifespan){
            bulletsToDelete.push(i);
        }

        b.pos.x += b.vel.x * b.speed;
        b.pos.y += b.vel.y * b.speed;

        ctx.fillStyle = "black";
        ctx.fillRect(b.pos.x - (b.size / 2), b.pos.y - (b.size / 2), 10, 10);
    }

    player.draw();

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        //elemental debuffs
        let damageDeduction = 1;
        let damageOverTime = 0;
        let stun = false;
        let damageTakenMultiplier = 1;

        if(enemy.element === "lightning"){
            //damage done to player is divided by 2
            damageDeduction = 2;
        }
        else if(enemy.element === "fire"){
            //.5 damage done to enemy every second
            damageOverTime = .5;
        }
        else if(enemy.element === "ice"){
            //enemy can no longer move
            stun = true;
        }
        else if(enemy.element === "poison"){
            //increases damage taken by 2x
            damageTakenMultiplier = 2;
        }

        enemy.draw();

        if(!stun){
            enemy.move();
        }

        if(enemy.elementCooldown != runtime){
            enemy.health -= damageOverTime;
            enemy.elementCooldown = runtime;
        }
        if(runtime > enemy.elementDuration){
            enemy.element = "";
            enemy.elementCooldown = runtime;
        }

        //ninja dash
        if(enemy.type === "ninja" && enemy.element !== "ice"){
            if(runtime - enemyTypes[enemy.type].cooldown >= enemy.previousRuntime){
                let d = new Vector2(player.pos.x - enemy.pos.x, player.pos.y - enemy.pos.y);
                let newVel = d.Normalize();

                enemy.pos.x += newVel.x * 100;
                enemy.pos.y += newVel.y * 100;
                enemy.previousRuntime = runtime;
                
            }
        }

        //enemy knockback on player collision
        if(Math.abs(player.pos.x - enemy.pos.x) <= (player.size / 2) + (enemy.size / 2)){
            if(Math.abs(player.pos.y - enemy.pos.y) <= (player.size / 2) + (enemy.size / 2)){
                let d = new Vector2(enemy.pos.x - player.pos.x, enemy.pos.y - player.pos.y);
                let newVel = d.Normalize();

                enemy.pos.x += newVel.x * 200;
                enemy.pos.y += newVel.y * 200;

                player.health -= enemy.damage / damageDeduction;
                enemy.health -= .5;
            }
        }


        for (let j = 0; j < bullets.length; j++) {
            let b = bullets[j];
            if(Math.abs(b.pos.x - enemy.pos.x) <= (b.size / 2) + (enemy.size / 2)){
                if(Math.abs(b.pos.y - enemy.pos.y) <= (b.size / 2) + (enemy.size / 2)){
                    //bullet hit enemy
                    enemy.element = player.element;
                    enemy.elementDuration = runtime + elementInfectionDuration;
                    enemy.health -= b.damage * damageTakenMultiplier;
                    bulletsToDelete.push(j);
                }
            }
        }
        if(enemy.health <= 0){
            enemiesToDelete.push(i);
        }
        
    }

    for (let i = 0; i < powerups.length; i++){
        let powerup = powerups[i];

        powerup.draw();

        if(Math.abs(powerup.pos.x - player.pos.x) <= (powerup.size / 2) + (player.size / 2)){
            if(Math.abs(powerup.pos.y - player.pos.y) <= (powerup.size / 2) + (player.size / 2)){
                powerupsToDelete.push(i);
                player.element = powerup.element;
                player.lastCollectedElement = runtime;
            }
        }
    }

    if(runtime > player.lastCollectedElement + elementPlayerDuration){
        player.element = "";
    }

    bulletsToDelete.sort();
    enemiesToDelete.sort();
    powerupsToDelete.sort();
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
        bullets.splice(bulletsToDelete[i] - i, 1);
    }
    
    for (let i = 0; i < enemiesToDelete.length; i++){
        enemies.splice(enemiesToDelete[i] - i, 1);
    }

    for (let i = 0; i < powerupsToDelete.length; i++){
        powerups.splice(powerupsToDelete[i] - i, 1);
    }

    if(runtime > lastTimePowerupSpawned + powerupCooldown){
        powerups.push(spawnPowerup());
        lastTimePowerupSpawned = runtime;
    }

    let speedstersToSpawn = wave * 3;
    let ninjasToSpawn = (wave - waveToSpawnNinja + 1) * (5);
    let tanksToSpawn = (wave - waveToSpawnTank + 1) * (5);

    if(ninjasToSpawn < 0){
        ninjasToSpawn = 0;
    }
    if(tanksToSpawn < 0){
        tanksToSpawn = 0;
    }

    if(!(enemiesSpawned.speedster === speedstersToSpawn && enemiesSpawned.ninja === ninjasToSpawn && enemiesSpawned.tank === tanksToSpawn)){
        if(runtime > lastSpawnedEnemy + spawnRate){
            spawnEnemy(speedstersToSpawn, ninjasToSpawn, tanksToSpawn);
        }
        
    }
    else if(enemies.length === 0){
        wave++;
        enemiesSpawned.speedster = 0;
        enemiesSpawned.ninja = 0;
        enemiesSpawned.tank = 0;
    }

    if (player.health <= 0){
        gameOverState = true;
    }

    drawHUD();
}

document.getElementById("canvas").onwheel = function(event){
    event.preventDefault();
};

document.getElementById("canvas").onmousewheel = function(event){
    event.preventDefault();
};

countSeconds();
init();
const player = new Player();
let gameInterval = setInterval(() => {gameLoop()}); 