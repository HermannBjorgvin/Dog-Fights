
/**************
	GLOBALS
**************/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var TO_RADIANS = Math.PI/180;

var bullets = [];

var planeSpritesheet = new Image();
planeSpritesheet.src = 'assets/plane.png';

var groundTexture = new Image();
groundTexture.src = 'assets/groundTexture2.png';
var groundPattern;

var treeTexture = new Image();
treeTexture.src = 'assets/treeTexture.png';
var treePattern;

groundTexture.onload = function(){
	groundPattern = ctx.createPattern(groundTexture,"repeat");
	treePattern = ctx.createPattern(treeTexture,"repeat");
}


/****************
	GAME TICK
****************/

window.onload = function(){

	gameTick.run(tick);

}

function tick(elapsed){

	// Clear canvas
	clearCanvas();

	// Draw game background and clouds and shit
	drawBackground();

	// Location/Velocity/AI
	aircraft.iterate(elapsed);
	aircraft.draw();

	// Bullets
	for (var i = bullets.length - 1; i >= 0; i--) {
		bullets[i].iterate(elapsed);
		bullets[i].draw();
		if (bullets[i].active != 1) {
			bullets.splice(i,1);
		};
	};

}

var gameSettings = {
	groundHeight: 60,
	gravity: {
		earth:9.81 * 0.5,
		mars:3.711 * 0.5,
		moon:1.622 * 0.5
	}
}

// This is my aircraft, there are many like it but this one is mine
var aircraft = {
	name: "TF-DESTROYER",
	x: 300, // Horizontal position
	y: 530, // Vertical position
	velX: 0, // Horizontal velocity
	velY: 0, // Vertical velocity
	
	width: (68 * 0.5),
	height: (87 * 0.5),
	scale: 0.5,
	power: 8, // Max engine output
	drag: 0.2, // Drag coefficient
	lift: 1.2, // Lift coefficient
	direction: 0, // 360° direction

	engineOn: false, // booleans that control movement
	turnCW: false, // Is turning clockwise
	turnCCW: false, // Is turning counter clockwise
	primaryWeapon: false, // Primary weapon
	primaryWeaponChargeTime: 0.125,
	primaryWeaponCharge:0,

	draw: function(){
		//drawRotatedImage(planeSpritesheet, this.x, this.y, this.direction, 0.5);

		var scale = this.scale;
		var angle = this.direction % 360;
		var x = Math.cos(angle * TO_RADIANS);
		var y = Math.sin(angle * TO_RADIANS);
		
		var frameNumber = 4;
		var frame = Math.round(Math.abs(x * (frameNumber-1)));

		var img = planeSpritesheet;
		var frameWidth = img.width/frameNumber;
		var frameHeight = img.height;

		ctx.save();
		ctx.translate(this.x, this.y);
    	ctx.rotate(angle * TO_RADIANS);

		ctx.drawImage(img, frameWidth*frame, 0, frameWidth, frameHeight, -(frameWidth/2) * scale, -(frameHeight/2) * scale, frameWidth * scale, frameHeight * scale);

		ctx.restore();

	},
	iterate: function(elapsed){
		
		var angle = this.direction % 360;

		// Gravity
		this.velY += gameSettings.gravity.earth * 0.5 * elapsed;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Ground drag

		// Aircraft lift - simple variation, not accurate
		// this.velY -= Math.abs(Math.cos(angle * TO_RADIANS) * this.velX * this.lift * elapsed);

		// Change direction
		if ((this.turnCW || this.turnCCW) && !(this.turnCW && this.turnCCW)) {
			var turnRadius = 0.75;
			if (this.engineOn == true) {
				turnRadius = 0.4;
			};
			if (this.turnCW) {
				this.direction += 360 * elapsed * turnRadius;
			};
			if (this.turnCCW) {
				this.direction -= 360 * elapsed * turnRadius;
			};
		};

		// Add engine velocity
		if (this.engineOn) {
			var x = Math.cos(angle * TO_RADIANS);
			var y = Math.sin(angle * TO_RADIANS);

			this.velX += this.power * x * elapsed;
			this.velY += this.power * y * elapsed;
		};

		/***************************
				BOUNDING BOX
		***************************/
		// RIGHT (exit right enter left)
		if (this.x >= canvas.width) {
			this.x = 0;
		};
		// LEFT (exit left enter right)
		if (this.x < 0) {
			this.x = canvas.width;
		};
		// TOP (ease down)
		if (this.y < 0) {
			this.velY += Math.pow(this.y, 2) * elapsed;
		};
		// BOTTOM (increased friction at ground level)
		if (this.y > canvas.height-gameSettings.groundHeight) {
			this.y = canvas.height-gameSettings.groundHeight;
			this.velX = bringToZero(this.velX, 3 * elapsed);
			this.velY = bringToZero(this.velY, 2 * elapsed);
			this.velY = -this.velY*0.6;
		};

		this.y = this.y + this.velY;
		this.x = this.x + this.velX;

		/**********************
				WEAPONS
		**********************/

		this.primaryWeaponCharge += elapsed;
		if (this.primaryWeapon && this.primaryWeaponCharge >= this.primaryWeaponChargeTime) {
			var x_delta = Math.cos(angle * TO_RADIANS) * this.width;
			var y_delta = Math.sin(angle * TO_RADIANS) * this.width;

			var newBullet = new bulletConstructor(this.x + x_delta, this.y + y_delta, this.velX, this.velY, this.direction);
			bullets.push(newBullet);
			this.primaryWeaponCharge = 0;
		};
	},
	keyHandler: function(key, state){
		switch(key){
			case 'throttle':
				this.engineOn = state;
			break;
			case 'turnCCW':
				this.turnCCW = state;
			break;
			case 'turnCW':
				this.turnCW = state;
			break;
			case 'primaryWeapon':
				this.primaryWeapon = state;
			break;
		}
	}
};

/***********************
	HELPER FUNCTIONS
***********************/

// Altering the math object to add a function that brings a number closer to zero by some delta
function bringToZero(number, delta) {
	if (number > 0) {
		if (number > delta) {
			return number - delta;
		}
		else{
			return 0;
		}
	}
	else if (number < 0) {
		if (number < -delta) {
			return number + delta;
		}
		else{
			return 0;
		}
	}
	else{
		return 0;
	};
};

/***********************
		CONTROLS
***********************/

// Aircraft
Mousetrap.bind({
    'a': function() { aircraft.keyHandler('turnCCW', true); },
    'd': function() { aircraft.keyHandler('turnCW', true); },
    'w': function() { aircraft.keyHandler('throttle', true); },
    'space': function() { aircraft.keyHandler('primaryWeapon', true); }
}, 'keydown');

Mousetrap.bind({
    'a': function() { aircraft.keyHandler('turnCCW', false); },
    'd': function() { aircraft.keyHandler('turnCW', false); },
    'w': function() { aircraft.keyHandler('throttle', false); },
    'space': function() { aircraft.keyHandler('primaryWeapon', false); }
}, 'keyup');

/***********************
	AIRCRAFT UPDATES
***********************/



/***********************
	RENDERING ENGINE	
***********************/

function drawBackground(){

	/**********
		SKY
	**********/

	// Main color
	ctx.fillStyle = "#8d3a1e";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	// Radial gradient to sky
	// Create gradient
	grd = ctx.createRadialGradient(canvas.width/2, canvas.height, 0, canvas.width/2, canvas.height, canvas.width);

	// Add colors
	grd.addColorStop(0, '#faad1b');
	grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

	// Fill with gradient
	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	/*************
		GROUND
	*************/

	// Main color
	ctx.fillStyle = "#451c1b";
	ctx.fillRect(0,canvas.height-gameSettings.groundHeight,canvas.width,gameSettings.groundHeight);

	// Texture
	ctx.fillStyle=groundPattern;
	ctx.fillRect(0,canvas.height-gameSettings.groundHeight,canvas.width,gameSettings.groundHeight);

	// Top line
	ctx.fillStyle = "#2c0f0e";
	ctx.fillRect(0,canvas.height-gameSettings.groundHeight,canvas.width,1);

	// Trees
	ctx.save();
	ctx.fillStyle=treePattern;
    ctx.translate(0, canvas.height-gameSettings.groundHeight-treeTexture.height);
	ctx.fillRect(0, 0, canvas.width, treeTexture.height);
	ctx.restore();

}

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
}