var HP = 100;var HP = 10000000;
var score = 0;
var money = 300000;
var FPS = 60;
var clock = 0;
// 創造 img HTML 元素，並放入變數中
var bgImg = document.createElement("img");
var enemyImg = document.createElement("img");
var btnImg = document.createElement("img");
var towerImg = document.createElement("img");
var crosshairImg = document.createElement("img");

// 設定這個元素的要顯示的圖片
bgImg.src = "images/map.png";
enemyImg.src = "images/slime.gif";
btnImg.src = "images/tower-btn.png";
towerImg.src = "images/tower.png";
crosshairImg.src = "images/crosshair.png"

// 找出網頁中的 canvas 元素
var canvas = document.getElementById("game-canvas");

// 取得 2D繪圖用的物件
var ctx = canvas.getContext("2d");

function draw(){
	clock++;
	if((clock%80) == 0){
		var newEnemy = new Enemy();
		enemies.push(newEnemy);
	}
	// 將背景圖片畫在 canvas 上的 (0,0) 位置
	ctx.drawImage(bgImg,0,0);
	for(var i = 0; i < enemies.length; i++){
		if(enemies[i].HP <= 0){
			enemies.splice(i, 1);
			score += 10;
			money += 30;
		}else{
			enemies[i].move();	
			ctx.drawImage(enemyImg,enemies[i].x,enemies[i].y);
		}
	}
	ctx.drawImage(btnImg,640-64,480-64,64,64);
	if(isBuilding == true){
		ctx.drawImage(towerImg,cursor.x-cursor.x%32,cursor.y-cursor.y%32);
	}
	for(var i = 0; i < towers.length; i++){
		ctx.drawImage(towerImg,towers[i].x,towers[i].y);
		towers[i].searchEnemy();
		if(towers[i].aimingEnemyId != null){
			var id = towers[i].aimingEnemyId;
			ctx.drawImage(crosshairImg, enemies[id].x, enemies[id].y)
		}
	}
	ctx.font = "24px Arial";
	ctx.fillStyle = "white";
	ctx.fillText("HP: " + HP, 10, 32);
	ctx.fillText("Score: " + score, 10, 64);
	ctx.fillText("Money: " + money, 10, 96);
}

// 執行 draw 函式
setInterval(draw, 1000/FPS);

var enemyPath = [
	{x: 96, y: 448},
	{x: 96, y: 64},
	{x: 384, y: 64},
	{x: 384, y: 192},
  {x: 224, y: 192},
	{x: 224, y: 320},
	{x: 544, y: 320},
	{x: 544, y: 96}
];

function Enemy(){
	this.x = 96;
	this.y = 448;
	this.HP = 10;
	this.speedX = 0;
	this.speedY = -64;
	this.pathDes = 0;
	this.move = function(){
		if(isCollided(enemyPath[this.pathDes].x,
					  enemyPath[this.pathDes].y,
					  this.x,
					  this.y,
					  64/FPS,
					  64/FPS)){
			// 移動
			this.x = enemyPath[this.pathDes].x;
			this.y = enemyPath[this.pathDes].y;
			// 指定
			this.pathDes++;
			if(this.pathDes == enemyPath.length){
				this.HP = 0;
				HP -= 10;
				return;
			}
			// 計算, 修改
			if( enemyPath[this.pathDes].y < this.y){

        // 往上走
				this.speedX = 0;
				this.speedY = -64;
			} else if(enemyPath[this.pathDes].x > this.x){
				// 往右走
				this.speedX = 64;
				this.speedY = 0;
			} else if(enemyPath[this.pathDes].y > this.y){
				// 往下走
				this.speedX = 0;
				this.speedY = 64;
			} else if(enemyPath[this.pathDes].x < this.x){
				// 往左走
				this.speedX = -64;
				this.speedY = 0;
			}
		}else{
			this.x += this.speedX/FPS;
			this.y += this.speedY/FPS;
		}
	}
}
var enemies = [];

var cursor = {
	x: 100,
	y: 200
}

function Tower(){
	this.x = 0;
	this.y = 0;
	this.range = 96;
	this.aimingEnemyId = null;
	this.searchEnemy = function(){
		this.readyToShootTime -= 1/FPS;
		for(var i=0; i<enemies.length; i++){
			var distance = Math.sqrt(Math.pow(this.x-enemies[i].x,2) + Math.pow(this.y-enemies[i].y,2));
			if (distance<=this.range) {
				this.aimingEnemyId = i;
				if(this.readyToShootTime <= 0){
					this.shoot(i);
					this.readyToShootTime = this.fireRate;
				}
				
        return;
			}
		}
		this.aimingEnemyId = null;
	};
	this.shoot = function(id){
		ctx.beginPath(); 
		ctx.moveTo(this.x, this.y); 
		ctx.lineTo(enemies[id].x, enemies[id].y); 
		ctx.strokeStyle = 'green'; 
		ctx.lineWidth = 3; 
		ctx.stroke(); 
		enemies[id].HP -= this.damage;
	};
	this.fireRate = 1;
	this.readyToShootTime = 1;
	this.damage = 5;
}
var towers = [];

$("#game-canvas").on("mousemove", mousemove);
function mousemove(event){
	cursor.x = event.offsetX;
	cursor.y = event.offsetY;
}

var isBuilding = false;

$("#game-canvas").on("click", mouseclick);
function mouseclick(){
	if(cursor.x > 576 && cursor.y > 416){
		isBuilding = true;
	} else{
		// 蓋塔
		if(isBuilding == true){
			if(money >= 174){
	        money -= 174;
            var newTower = new Tower();
			newTower.x = cursor.x - cursor.x%32;
			newTower.y = cursor.y - cursor.y%32;
			towers.push(newTower);
			}
		}
		// 建造完成
		isBuilding = false;
	}
}

function isCollided(pointX, pointY, targetX, targetY, targetWidth, targetHeight){
	if(targetX <= pointX &&
				  pointX <= targetX + targetWidth &&
	   targetY <= pointY &&
				  pointY <= targetY + targetHeight){
		return true;
	}else{
		return false;
	}
}