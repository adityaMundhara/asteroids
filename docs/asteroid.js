var canvas;
var asteroid;
var spaceShip;
var space;
/** @type {CanvasRenderingContext2D} */
var context;
//keyboard vars
const MAX_MISSILES = 3;
const MAX_ASTEROID = 7;
var missilesPool = [];
var asteroidPool = [];
var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;
var keySpace = false;
var interval;
var asteroid_Speed = 4;
var ship_Speed = 7;
var inertia = 0;

function keyboardInit() {
	window.onkeydown = function (e) {
		switch (e.keyCode) {
			//key A or LEFT
			case 65:
			case 37:

				keyLeft = true;

				break;

				//key W or UP
			case 87:
			case 38:

				keyUp = true;

				break;

				//key D or RIGHT
			case 68:
			case 39:

				keyRight = true;

				break;

				//key Space
			case 32:
			case 75:

				keySpace = true;

				break;
			case 40:
				keyDown = true;
		}

		e.preventDefault();
	};

	window.onkeyup = function (e) {
		switch (e.keyCode) {
			//key A or LEFT
			case 65:
			case 37:

				keyLeft = false;

				break;

				//key W or UP
			case 87:
			case 38:

				keyUp = false;

				break;

				//key D or RIGHT
			case 68:
			case 39:

				keyRight = false;

				break;

				//key Space
			case 75:
			case 32:

				keySpace = false;

				break;
			case 40:
				keyDown = false;
		}

		e.preventDefault();
	};
}

function renderer() {
	space.renderSpace();
	// space,spaceship,bullets,asteroid
	spaceShip.renderSpaceShip();
	for (let i = 0; i < missilesPool.length; i++) {
		missilesPool[i].renderMissile();
	}
	for (let i = 0; i < asteroidPool.length; i++) {
		asteroidPool[i].renderAsteroid();
	}
}

class MovingObjects {
	pos_x;
	pos_y;
}

class Space {
	frame_width;
	frame_height;
	constructor() {
		var rect = canvas.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		this.frame_width = canvas.width;
		this.frame_height = canvas.height;
	}
	renderSpace() {
		context.fillStyle = "#000";
		context.fillRect(0, 0, this.frame_width, this.frame_height);
		context.globalAlpha = 0.4;
		for(let i=0;i<100;i++){
			context.beginPath();
			context.arc(
				Math.floor(this.frame_width*Math.random())
			,Math.floor(this.frame_height*Math.random())
			,1,0,2*Math.PI)
			context.stroke();
		}
		context.globalAlpha=1;
	}

}

class SpaceShip extends MovingObjects {
	speed = 0;
	pos_x = space.frame_width / 2;
	pos_y = space.frame_height / 2;
	isCrashed = false;
	angle = 0;
	isDead = false;
	score = 0;
	renderSpaceShip() {
		context.translate(this.pos_x, this.pos_y);
		context.rotate(this.angle);
		context.strokeStyle = '#FFF';
		context.lineWidth = (Math.random() > 0.9) ? 2 : 1;
		context.beginPath();
		context.arc(10, 0, 1, 0, 2 * Math.PI);
		context.moveTo(10, 0);
		context.lineTo(-10, -10);
		context.lineTo(-5, 0);
		context.lineTo(-10, 10);
		context.lineTo(10, 0)
		context.closePath();
		context.stroke();
		context.setTransform(1, 0, 0, 1, 0, 0);
	}
}

class Missile extends MovingObjects {
	pos_x = spaceShip.pos_x;
	pos_y = spaceShip.pos_y;
	angle = 0;
	constructor(ship) {
		super();
		this.pos_x = ship.pos_x;
		this.pos_y = ship.pos_y;
		this.angle = ship.angle;
	}
	renderMissile() {
		context.lineWidth = (Math.random() > 0.9) ? 2 : 1;
		context.beginPath();
		context.arc(this.pos_x, this.pos_y, 2, 0, 2 * Math.PI);
		context.stroke();
	}
}

class Asteroid extends MovingObjects {
	pos_x = spaceShip.pos_x;
	pos_y = spaceShip.pos_y;
	angle = 0;
	constructor(Fx, Fy, angle) {
		super();
		this.pos_x = Fx;
		this.pos_y = Fy;
		this.angle = angle;
	}
	renderAsteroid() {
		context.lineWidth = (Math.random() > 0.9) ? 2 : 1;
		context.beginPath();
		context.arc(this.pos_x, this.pos_y, 50, 0, 2 * Math.PI);
		context.stroke();
	}
}

function update() {
	updateSpaceShip();
	updateMissiles();
	updateAsteroid();
}

function updateAsteroid() {
	const angle = 15;
	let remove = [];

	for (let i = 0; i < asteroidPool.length; i++) {
		asteroidPool[i].pos_x += Math.cos(asteroidPool[i].angle) * asteroid_Speed;
		asteroidPool[i].pos_y += Math.sin(asteroidPool[i].angle) * asteroid_Speed;

		if (asteroidPool[i].pos_x >= space.frame_width || asteroidPool[i].pos_x < 0 || asteroidPool[i].pos_y > space.frame_height || asteroidPool[i].pos_y < 0) {
			remove.push(i);
		}
	}
	for (let j = 0; j < remove.length; j++) {
		asteroidPool.splice(remove[j], 1);
	}
	// generate new asts
	for (let ast = asteroidPool.length; ast < MAX_ASTEROID; ast++) {
		// V shaped asteroid field, constant X value with random 0-90 deg of field view for asteroid
		// Asteroid Coordinates : top => (rand_X,0) , right=>(max_X,rand_y), bottom=> (rand_x,max_Y), left=>(0,rand_y)
		var x = 0,
			y = 0,
			deg = Math.floor(90 * Math.random()) + angle;
		switch (Math.floor(4 * Math.random())) {
			case 1: { // rand_x,0
				x = Math.floor(space.frame_width * Math.random());
				break;
			}
			case 2: { // max_x,rand_y
				x = space.frame_width;
				y = Math.floor(space.frame_height * Math.random());
				break;
			}
			case 3: { //rand_x,maxy
				x = Math.floor(space.frame_width * Math.random());
				y = space.frame_height;
				break;
			}
			case 4: {
				// 0,rand_y
				y = Math.floor(space.frame_height * Math.random());
				break;
			}
		}
		asteroidPool[ast] = new Asteroid(x, y, deg);
	}

}

function updateMissiles() {
	let length = missilesPool.length;
	let remove = [];
	for (let i = 0; i < length; i++) {
		missilesPool[i].pos_x += Math.cos(missilesPool[i].angle) * 10;
		missilesPool[i].pos_y += Math.sin(missilesPool[i].angle) * 10;
		if (missilesPool[i].pos_x >= space.frame_width || missilesPool[i].pos_x < 0 || missilesPool[i].pos_y > space.frame_height || missilesPool[i].pos_y < 0) {
			remove.push(i);
		}
	}
	for (let j = 0; j < remove.length; j++) {
		missilesPool.splice(remove[j], 1);
	}
}

function updateSpaceShip() {

	if (keyUp) {
		inertia = 0.8;
		spaceShip.pos_x += Math.cos(spaceShip.angle) * ship_Speed;
		spaceShip.pos_y += Math.sin(spaceShip.angle) * ship_Speed;
	} else {
		spaceShip.pos_x += Math.cos(spaceShip.angle) * inertia;
		spaceShip.pos_y += Math.sin(spaceShip.angle) * inertia;
	}
	if (keyLeft) spaceShip.angle -= 0.1;
	if (keyRight) spaceShip.angle += 0.1;

	if (spaceShip.pos_x > space.frame_width) {
		spaceShip.pos_x = 0;
	} else if (spaceShip.pos_x < 0) {
		spaceShip.pos_x = space.frame_width;
	}
	if (spaceShip.pos_y > space.frame_height) {
		spaceShip.pos_y = 0;
	} else if (spaceShip.pos_y < 0) {
		spaceShip.pos_y = space.frame_height;
	}

	if (keySpace) {
		if (missilesPool.length < MAX_MISSILES) {
			missilesPool.push(new Missile(spaceShip));
		};
		keySpace = false;
	}
	if (keyDown) {
		inertia = 0;
	}
}

function killAsteroids() {
	var removeMissile = [],
		removeAsts = [];
	for (var i = 0; i < missilesPool.length; i++) {
		for (var j = 0; j < asteroidPool.length; j++) {
			// calculate the missile to asteroid distance and check if it is less than or equal to radius
			var distance = Math.floor(Math.sqrt(
				Math.pow(missilesPool[i].pos_x - asteroidPool[j].pos_x, 2) + Math.pow(missilesPool[i].pos_y - asteroidPool[j].pos_y, 2)
			))
			if (distance <= 52) {
				removeMissile.push(i);
				removeAsts.push(j);
				if (!spaceShip.isDead) {
					spaceShip.score += 200;
				}
			}
		}
	}
	removeMissile.forEach((i) => missilesPool.splice(i, 1));
	removeAsts.forEach((i) => asteroidPool.splice(i, 1));
}

function isGameOver() {
	for (var j = 0; j < asteroidPool.length; j++) {
		var distance = Math.floor(Math.sqrt(
			Math.pow(spaceShip.pos_x - asteroidPool[j].pos_x, 2) + Math.pow(spaceShip.pos_y - asteroidPool[j].pos_y, 2)
		))
		if (distance <= 50) {
			spaceShip.isDead = true;
			break;
		}
	}
}

function score() {
	spaceShip.score++;
	var ctx = context;
	ctx.font = "20px Comic Sans MS";
	ctx.fillStyle = "red";
	ctx.textAlign = "center";
	ctx.fillText(`Score:${spaceShip.score}`,
		70, 50);
}

function gameOverScreen() {
	var ctx = context;
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	context.fillStyle = "#000";
	context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	ctx.font = "60px Comic Sans MS";
	ctx.fillStyle = "red";
	ctx.textAlign = "center";
	ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
	ctx.font = '60px System, monospace';
	ctx.fillText(`Score:${spaceShip.score}`,
		canvas.width / 2, canvas.height / 2 + 50);
	ctx.fillText(`Click Space to start`,
		canvas.width / 2, canvas.height - 100);
}

function init() {
	canvas = document.getElementById('mainFrame');
	context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	space = new Space();
	spaceShip = new SpaceShip();
	asteroidPool=[];
	missilesPool=[];
	inertia=0;
	startLoop();
	keyboardInit();
}

window.onload = init;
window.onresize = update;

function loop() {
	if (!spaceShip.isDead) {
		update();
		renderer();
		killAsteroids();
		isGameOver();
		score();
	} else {
		gameOverScreen();
		if (keySpace) {
			window.clearInterval(interval);
			spaceShip.isDead = false;
			init();
		}
	}

}

function startLoop() {
	interval = setInterval(loop, 1000 / 60);
}
