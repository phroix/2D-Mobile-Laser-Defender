
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

const startAngle = 0;
const endAngle = Math.PI * 2;

let enemySpawnDelay = 200;
let gameOver = false;

class GameController{
    constructor(x,y,r,ctx,canvas,player,enemyController){
        this.ctx=ctx;
        this.canvas = canvas;
        this.player = player;
        this.enemyController = enemyController;

        this.x=x;
        this.y=y;
        this.r=r;

        this.fillColor = "white";
    }

    gameControllerDrawPath(){
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.arc(this.x,this.y,this.r,startAngle,endAngle);
        this.ctx.fillStyle = this.fillColor;
        this.ctx.lineWidth = 8;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.font="75px Arial";
        this.ctx.translate(880,1320);
        this.ctx.rotate(Math.PI/2)
        this.ctx.fillText("retry",10,600)
        this.ctx.restore();

    }

    resetData(){
        this.player.hp = 3;
        this.player.score = 0;
        enemySpawnDelay = 200;
    }

    addEvent(){//Touch events
        this.canvas.addEventListener("touchstart", e=>{
                e.preventDefault();
                gameOver = false;
        })

        this.canvas.addEventListener("touchmove", e=>{
            e.preventDefault();
        })

        this.canvas.addEventListener("touchend", e=>{
            e.preventDefault();
        })
    }



}

class Enemy{
    constructor(x,y,r,ctx){
        this.ctx=ctx;

        this.x=x;
        this.y=y;
        this.r=r;

        this.dx = 5;
        this.dy = 5;

        this.fillColor = "white";
    }

    enemyDrawPath(){ //draws enemy Path
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.fillStyle = this.fillColor;
        this.ctx.arc(this.x,this.y,this.r,startAngle,endAngle);
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.closePath();
    }

    goTo(targetX,targetY){ //moves enemy to targetX,targetY position
        if(Math.abs(this.x-targetX)<this.dx && Math.abs(this.y-targetY)<this.dy){ //if enemy at targetX,targetY position stop moving
            this.dx=0;
            this.dy=0;
            this.x = targetX;
            this.y = targetY;
        }
        else{
            const opp = targetY - this.y;
            const adj = targetX - this.x;

            const angle = Math.atan2(opp,adj)

            this.x += Math.cos(angle)*this.dx;
            this.y += Math.sin(angle)*this.dy;
        }

}
}

class EnemyController{
    constructor(x,y,r,ctx,player,joyStick){
        this.ctx=ctx;
        this.player = player;
        this.joyStick = joyStick;

        this.x=x;
        this.y=y;
        this.r=r;

        this.enemySpeedX = 50 * joyStick.dx;
        this.enemySpeedY = 50 *joyStick.dy;

        this.fillColor = "rgb(0, 162, 255)";

        this.enemies = [];
        this.timeTillNextSpawn = 0

    }

    enemyControllerDrawPath(){ //draw 4 points where enemys spawn
        for (let index = 0; index < 4; index++) {
            this.ctx.beginPath();
            this.ctx.save();
            this.ctx.arc(this.x[index],this.y[index],this.r,startAngle,endAngle);
            this.ctx.fillStyle = this.fillColor;
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.restore();
        }
    }

    enemyControllerSpawnEnemies(){ //let enemys spawn random at 1 of 4 points
        if(this.timeTillNextSpawn <= 0){ //with spawndelay
            const randSpawnNumb = Math.round(Math.random() * 3);
            this.timeTillNextSpawn = enemySpawnDelay;
            this.enemies.push(new Enemy(this.x[randSpawnNumb],this.y[randSpawnNumb],60,this.ctx))
        }
        for (let index = 0; index < this.enemies.length; index++) { //draw enemys, move to player, check for collision with player
            if(this.player.score >= 10){ //make game more difficult after score >= 10
                enemySpawnDelay = 100;
            }
            this.enemies[index].enemyDrawPath();
            this.enemies[index].goTo(this.player.x,this.player.y);
            this.player.playerEnemyCollision(this.enemies,this.enemies[index]);
        }
        this.timeTillNextSpawn--;
    }
}

class Player
{
    constructor(x,y,r,hp,score,ctx,canvas,joyStick){
        this.ctx=ctx;
        this.canvas = canvas;
        this.joyStick = joyStick;

        this.x = x;
        this.y = y;
        this.r = r;
        this.v=
        {
            x:10,y:10
        }

        this.hp = hp;
        this.score = score;

        this.startAngle = 0;
        this.endAngle = Math.PI*2;
        this.angle = 0;
    }

    playerDrawPath()//draw player
    {
        this.ctx.fillStyle = "black";
        this.ctx.arc(this.x,this.y,this.r,this.startAngle,this.endAngle);
        this.ctx.fill();

        this.angle = Math.atan2(this.joyStick.dy,this.joyStick.dx*-1)*(-1);

        this.ctx.save();
        this.ctx.translate(this.x,this.y);
        this.ctx.rotate(this.angle);
        this.ctx.beginPath();
        this.ctx.fillStyle = "red";
        this.ctx.rect(this.r,-15,20,30);
        this.ctx.fill();
        this.ctx.restore();

    }

    playerMove()//move player
    {
        let canvasWidth=this.canvas.width-10;
        let canvasHeight=this.canvas.height-10;

        let playerPosX = this.x+this.r;
        let playerNegX = this.x-this.r;

        let playerPosY = this.y+this.r;
        let playerNegY = this.y-this.r;

        if(this.joyStick.pressed)
        {
            //move only inside of canvas
            if(playerPosX < canvasWidth && playerNegX > 10)
            {
                this.x-=this.v.x*this.joyStick.dx;
            }

            if(playerPosY < canvasHeight && playerNegY > 10)
            {
                this.y-=this.v.y*this.joyStick.dy;
            }
        }

        //if touch end of canvas top,bottom,right,left bounce in opposite direction
        if(playerPosX >= canvasWidth && playerPosX <= canvasHeight+10)
        {
            this.x -= 1;
        }
        if(playerNegX >= 0 && playerNegX <= 10)
        {
            this.x += 1;
        }

        if(playerPosY >= canvasHeight && playerPosY <= canvasHeight+10)
        {
            this.y -= 1;
        }
        if(playerNegY >= 0 && playerNegY <= 10)
        {
            this.y += 1;
        }

    }

    playerEnemyCollision(enemies,enemy){

        if(distance(enemy.x,enemy.y,this.x,this.y) < enemy.r){
            const index = enemies.indexOf(enemy);
            if (index > -1) // only splice array when item is found
                enemies.splice(index, 1);
            this.hp -= 1;
        }

        if(this.hp <= 0){
            gameOver = true;
        }
    }

    drawPlayerText()
    {
        //Score and HP
        this.ctx.font="50px Arial";
        this.ctx.save();
        this.ctx.translate(1520,10);
        this.ctx.rotate(Math.PI/2)
        this.ctx.fillText("HP: " + this.hp, 10,600);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.translate(1520,1450);
        this.ctx.rotate(Math.PI/2)
        this.ctx.fillText("Score: " + this.score, 10,600);
        this.ctx.restore();
    }

}

class JoyStick
{
    constructor(x,y,r,canvas,ctx){
        this.canvas = canvas;
        this.ctx=ctx;

        //inncer circle
        this.x=x;
        this.y=y;
        this.r=r;

        this.dx=0;
        this.dy=0;

        this.fillColor = "lightblue";

        //outer circle
        this.X=this.x;
        this.Y=this.y;
        this.R=this.r+30;

        //when Joystick is pressed
        this.pressed=false;
        this.distance=false;
    }

    joyStickCheckCircle(){//check for pressed

        if(this.pressed){//when pressed reset inner circle to offset

            let activeX=this.X-this.x;
            let activeY=this.Y-this.y;

            let activeDist=Math.sqrt(activeX*activeX+activeY*activeY);

            this.dx=activeX/activeDist;
            this.dy=activeY/activeDist;

            if(activeDist>this.R){
                let offset = Math.abs(this.R-activeDist);//distnace from center of dynamic to fixed

                let offsetX=offset*this.dx;
                let offsetY=offset*this.dy;

                this.x += offsetX;
                this.y += offsetY;

            }
        }else{
            this.x = this.X;
            this.y = this.Y;
        }
    }

    joyStickDrawPath(){//draw Joystick

        //outer arc
        this.ctx.beginPath();
        this.ctx.lineWidth = 8;
        this.ctx.arc(this.X,this.Y,this.R,0,Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        //inner arc
        this.ctx.save();
        this.ctx.arc(this.x,this.y,this.r,startAngle,endAngle);
        this.ctx.fillStyle = this.fillColor;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();

    }

    addEvent(){//Touch events
        this.canvas.addEventListener("touchstart", e=>{
            if(!this.distance){
                e.preventDefault();
                this.x=e.touches[0].clientX;
                this.y=e.touches[0].clientY;
                this.pressed=true;
            }
        })

        this.canvas.addEventListener("touchmove", e=>{
            e.preventDefault();
            this.x=e.touches[0].clientX;
            this.y=e.touches[0].clientY;

        })

        this.canvas.addEventListener("touchend", e=>{
            e.preventDefault();
            if(e.touches.length != 1){
                this.x=e.changedTouches[0].clientX;
                this.y=e.changedTouches[0].clientY;
                this.pressed=false;
            }
        })
    }

    // drawJoystickText(){//Debug method
    //     this.ctx.font="20px Arial";
    //     this.ctx.fillText("dx: " + Math.round(this.dx),22,88);
    //     this.ctx.fillText("dy: " + Math.round(this.dy),22,110);

    //     this.ctx.fillText("Joy pressed: " + this.pressed,22,44);
    // }

}

class Projectile{
    constructor(x,y,r,shootAngle,ctx){
        this.ctx=ctx;

        this.x=x;
        this.y=y;
        this.r=r;

        this.xSpeed = 0;
        this.ySpeed = 0;

        this.shootAngle = shootAngle;
        this.fillColor = "blue";
        // this.bulletX = bulletX;
        // this.bulletY = bulletY;

    }

    projectileDrawPath(){//drwan projectile Path
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.arc(this.x,this.y,this.r,startAngle,endAngle);
        this.ctx.rotate(this.shootAngle);
        this.ctx.fillStyle = this.fillColor;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    projectileMove(){ //move projectile
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    // drawProjectileText(){ Debug Method
    //     this.ctx.font="20px Arial";
    //     this.ctx.fillText("x: " + Math.round(this.x),22,200);
    //     this.ctx.fillText("y: " + Math.round(this.y),22,222);

    //     // this.ctx.fillText("isPressed: " + this.pressed,522,110);

    // }
}

class ShootStick{
    constructor(x,y,r,canvas,ctx,joyStick,player,enemyController){
        this.canvas = canvas;
        this.ctx=ctx;
        this.joyStick = joyStick;
        this.player = player;
        this.enemyController = enemyController;

        this.x=x;
        this.y=y;
        this.r=r;

        this.dx=0;
        this.dy=0;

        this.idStart=null;
        this.fillColor = "grey";

        this.shoot=false;
        this.pressed=false;

        //bullet vars
        this.bulletX = this.player.x;
        this.bulletY = this.player.y;
        this.shootAngle = 0;
        this.bulletSpeedX = 10;
        this.bulletSpeedY = 10;

        this.projectiles = [];
        this.timeTillNextBullet = 0;
        this.index = 0;
    }

    shootStickCheckCircle(){//check for touch on shootstick, only touched when joystick active
        this.shoot = distance(this.dx,this.dy,this.x,this.y) < this.r;
        if(this.joyStick.pressed) this.fillColor = "#FF9494";
        else this.fillColor = "grey";
    }

    shootStickDrawPath(){//draw shootStick Path
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.arc(this.x,this.y,this.r,startAngle,endAngle);
        this.ctx.fillStyle = this.fillColor;
        this.ctx.moveTo(this.x-50,this.y);
        this.ctx.lineTo(this.x+50,this.y);
        this.ctx.moveTo(this.x,this.y-50);
        this.ctx.lineTo(this.x,this.y+50);
        this.ctx.lineWidth = 8;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    shootStickShootProjectile(){//Shoot Projectile
        if(this.shoot && this.timeTillNextBullet <= 0){//shoot with delay
            this.shootAngle = Math.atan2(this.joyStick.dy,this.joyStick.dx*-1)*(-1);

            this.bulletX = this.player.x;
            this.bulletY = this.player.y;
            this.pressed = true;
            this.bulletSpeedX = 50 * this.joyStick.dx;
            this.bulletSpeedY = 50 *this.joyStick.dy;

            const delay = 20;

            this.projectiles.push(new Projectile(this.bulletX,this.bulletY,this.player.r/3,this.shootAngle,this.ctx));

            this.timeTillNextBullet = delay;
        }
        this.timeTillNextBullet--;

        if(this.pressed){//after pressed shootstick

            for (let index = 0; index < this.projectiles.length; index++) {
                if(distance(this.projectiles[this.index].x,this.projectiles[this.index].y,this.player.x,this.player.y) > this.player.r) {
                    //show projectile when exits player radius
                    this.projectiles[this.index].projectileDrawPath();
                }
                this.projectiles[this.index].projectileMove(); //move projectile
                this.index = index;
            }
            //set speed of projectile
            this.projectiles[this.index].xSpeed = this.bulletSpeedX *-1;
            this.projectiles[this.index].ySpeed = this.bulletSpeedY *-1;

            //check for collision with projectile and enemy
            this.enemyController.forEach(enemy => {
                if(distance(enemy.x,enemy.y,this.projectiles[this.index].x,this.projectiles[this.index].y) < enemy.r){
                    const index =  this.enemyController.indexOf(enemy);
                    if (index > -1) // only splice array when item is found
                        this.enemyController.splice(index, 1);
                    this.player.score += 1;
                }
            });

            // this.projectiles[this.index].drawProjectileText(); Debug Method
        }
    }

    addEvent(){ //touch events of shootstick
        this.canvas.addEventListener("touchstart", e=>{
            e.preventDefault();
            if(this.joyStick.pressed){
                this.dx = e.touches[1].clientX;
                this.dy = e.touches[1].clientY;
            }

        })

        this.canvas.addEventListener("touchmove", e=>{
            e.preventDefault();

        })

        this.canvas.addEventListener("touchend", e=>{
            e.preventDefault();
            this.shoot=false;
            this.dx = 0;
            this.dy = 0;
        })

    }

    // drawShootStickText(){ Debug Method
    //     this.ctx.font="20px Arial";
    //     // this.ctx.fillText("x: " + Math.round(this.x),22,22);
    //     // this.ctx.fillText("y: " + Math.round(this.y),22,44);

    //     // this.ctx.fillText("Shoot pressed: " + this.pressed,22,64);
    //     // this.ctx.fillText("projectiles.length: " + this.projectiles.length,222,22);
    //     // this.ctx.fillText("this.index: " + this.index,222,44);

    //     this.ctx.fillText("this.bulletX: " + this.bulletX,522,22);
    //     this.ctx.fillText("this.bulletY: " + this.bulletY,522,44);
    //     // this.ctx.fillText("this.dx: " + this.dx,522,66);
    //     // this.ctx.fillText("this.dy: " + this.dy,522,88);
    //     // this.ctx.fillText("shoot.distance: " + this.shoot,522,110);
    //     // this.ctx.fillText("joystick.distance: " + this.joyStick.distance,522,132);
    //     // this.ctx.fillText("isPressed: " + this.pressed,522,110);

    // }
}

(function Init() {

    const canvas = document.getElementById("canvas01");
    const ctx = canvas.getContext('2d');


    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    addEventListener("resize", resize);

    let joyStick = new JoyStick(300,300,100,canvas,ctx);
    let player = new Player(500,1000,40,3,0,ctx,canvas,joyStick);
    let enemyController = new EnemyController([500,500,980,1],[1750,1,900,900],10,ctx,player,joyStick);
    let shootStick = new ShootStick(300,1400,100,canvas,ctx,joyStick,player,enemyController.enemies);
    let gameController = new GameController(300,1400,120,ctx,canvas,player);

    let tmpScore;

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        if(!gameOver){

            player.playerDrawPath();
            player.playerMove();
            player.drawPlayerText();
            tmpScore = player.score;

            shootStick.shootStickCheckCircle();
            shootStick.shootStickShootProjectile();
            shootStick.shootStickDrawPath();
            // shootStick.drawShootStickText();

            joyStick.joyStickCheckCircle();
            joyStick.joyStickDrawPath();
            // joyStick.drawJoystickText();

            enemyController.enemyControllerDrawPath();
            enemyController.enemyControllerSpawnEnemies();
        }else{
            gameController.resetData();
            gameController.gameControllerDrawPath();
            ctx.font="100px Arial";
            ctx.save();
            ctx.translate(1100,500);
            ctx.rotate(Math.PI/2)
            ctx.fillText("GAME OVER", 10,600);
            ctx.restore();
            
            ctx.save();
            ctx.translate(1300,600);
            ctx.rotate(Math.PI/2)
            ctx.fillText("Score: " + tmpScore, 10,600);
            ctx.restore();
        }

        window.requestAnimationFrame(draw);
    }
    //Touch Events
    shootStick.addEvent();
    joyStick.addEvent();
    gameController.addEvent();
    draw();
    resize()
}());