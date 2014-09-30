
/**************
	GLOBALS
**************/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var TO_RADIANS = Math.PI/180;
var TO_DEGREES = 180/Math.PI;

var projectiles = [];

/*********************
		ASSETS
*********************/

var planeSpritesheet = new Image();
planeSpritesheet.src = 'assets/entities/plane.png';

var tankImage = new Image();
tankImage.src = 'assets/entities/tank.png';

var groundTexture = new Image();
groundTexture.src = 'assets/terrain/groundTexture.png';
var groundPattern;

var treeTexture = new Image();
treeTexture.src = 'assets/terrain/treeTexture.png';
var treePattern;

var assets = {
	entities:{
		plane: null
	},
	terrain:{
		trees: null,
		ground: null
	}
};

window.onload = function(){
	groundPattern = ctx.createPattern(groundTexture,"repeat");
	treePattern = ctx.createPattern(treeTexture,"repeat");
}

/***********************
	AIRCRAFT UPDATES
***********************/

// This is my aircraft, there are many like it but this one is mine
var aircraft = {
	name: "TF-DESTROYER",
	x: 300, // Horizontal position
	y: 530, // Vertical position
	velX: 0, // Horizontal velocity
	velY: -5, // Vertical velocity
	
	width: (68 * 0.5),
	height: (87 * 0.5),
	scale: 0.35,
	power: 6, // Max engine output
	drag: 0.2, // Drag coefficient
	lift: 0.3, // Lift coefficient
	direction: 270, // 360° direction

	engineOn: false, // booleans that control movement
	turnCW: false, // Is turning clockwise
	turnCCW: false, // Is turning counter clockwise

	primaryWeapon: false, // Primary weapon
	primaryWeaponChargeTime: 0.05,
	primaryWeaponCharge:0,

	secondaryWeapon: false, // Primary weapon
	secondaryWeaponChargeTime: 2,
	secondaryWeaponCharge:0,

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
		this.velY += gameSettings.gravity.earth * elapsed;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Ground drag

		// Aircraft lift - simple variation, not accurate
		this.velY -= Math.abs(Math.cos(angle * TO_RADIANS) * this.velX * this.lift * elapsed);

		// Change direction
		if ((this.turnCW || this.turnCCW) && !(this.turnCW && this.turnCCW)) {
			var turnRadius = 0.75;
			if (this.engineOn || this.primaryWeapon) {
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

			var spread = Math.random() * 4 - 2;
			var newBullet = new bulletConstructor(this.x + x_delta, this.y + y_delta, this.velX, this.velY, this.direction + spread);
			projectiles.push(newBullet);
			this.primaryWeaponCharge = 0;
		};

		this.secondaryWeaponCharge += elapsed;
		if (this.secondaryWeapon && this.secondaryWeaponCharge >= this.secondaryWeaponChargeTime) {
			var x_delta = Math.cos(angle * TO_RADIANS) * this.width;
			var y_delta = Math.sin(angle * TO_RADIANS) * this.width;

			var newBomb = new bombConstructor(this.x + x_delta, this.y + y_delta, this.velX, this.velY, this.direction);
			projectiles.push(newBomb);
			this.secondaryWeaponCharge = 0;
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
			case 'secondaryWeapon':
				this.secondaryWeapon = state;
			break;
		}
	}
};
/***********************
	AIRCRAFT UPDATES
***********************/

// This is my aircraft, there are many like it but this one is mine
var drone = {
	name: "TF-DRONE",
	x: 600, // Horizontal position
	y: 530, // Vertical position
	velX: 0, // Horizontal velocity
	velY: -5, // Vertical velocity
	
	width: (68 * 0.5),
	height: (87 * 0.5),
	scale: 0.35,
	power: 6, // Max engine output
	drag: 0.2, // Drag coefficient
	lift: 0.3, // Lift coefficient
	direction: 355, // 360° direction

	engineOn: true, // booleans that control movement
	turnCW: false, // Is turning clockwise
	turnCCW: false, // Is turning counter clockwise

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
	
		/******************************
			DRONE TARGETTING SYSTEM
		******************************/
		
			var target_x = aircraft.x;
			var target_y = aircraft.y;

			var target_x_diff = target_x - this.x;
			var target_y_diff = target_y - this.y;

			var target_angle = Math.atan2(target_x_diff, target_y_diff) * TO_DEGREES + 90;

			if (target_angle > this.direction) {
				this.direction += 60 * elapsed;
			}
			else if(target_angle < this.direction){
				this.direction -= 60 * elapsed;
			};

		/**********
			END
		**********/

		var angle = this.direction % 360;

		// Gravity
		this.velY += gameSettings.gravity.earth * elapsed;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Ground drag

		// Aircraft lift - simple variation, not accurate
		this.velY -= Math.abs(Math.cos(angle * TO_RADIANS) * this.velX * this.lift * elapsed);


		// Change direction
		/*if ((this.turnCW || this.turnCCW) && !(this.turnCW && this.turnCCW)) {
			var turnRadius = 0.75;
			if (this.engineOn || this.primaryWeapon) {
				turnRadius = 0.4;
			};
			if (this.turnCW) {
				this.direction += 360 * elapsed * turnRadius;
			};
			if (this.turnCCW) {
				this.direction -= 360 * elapsed * turnRadius;
			};
		};*/

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
	}
};

/***********************
		CONTROLS
***********************/

/*aircraft.bindControls({
	turnCCW: 'a',
	turnCW: 'd',
	throttle: 'w',
	primaryWeapon: ',',
	secondaryWeapon: '.'
});*/

// Aircraft
Mousetrap.bind({
    'a': function() { aircraft.keyHandler('turnCCW', true); },
    'd': function() { aircraft.keyHandler('turnCW', true); },
   	'w': function() { aircraft.keyHandler('throttle', true); },
   	',': function() { aircraft.keyHandler('primaryWeapon', true); },
    '.': function() { aircraft.keyHandler('secondaryWeapon', true); }
}, 'keydown');

Mousetrap.bind({
    'a': function() { aircraft.keyHandler('turnCCW', false); },
    'd': function() { aircraft.keyHandler('turnCW', false); },
   	'w': function() { aircraft.keyHandler('throttle', false); },
   	',': function() { aircraft.keyHandler('primaryWeapon', false); },
    '.': function() { aircraft.keyHandler('secondaryWeapon', false); }
}, 'keyup');

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

	drone.iterate(elapsed);
	drone.draw();

	// Projectiles
	for (var i = projectiles.length - 1; i >= 0; i--) {
		projectiles[i].iterate(elapsed);
		projectiles[i].draw();
		if (projectiles[i].active != 1) {
			projectiles.splice(i,1);
		};
	};

}

var gameSettings = {
	groundHeight: 60,
	gravity: {
		earth:9.81 * 0.25,
		mars:3.711 * 0.25,
		moon:1.622 * 0.25
	}
}

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
	grd = ctx.createRadialGradient(canvas.width/2, canvas.height-gameSettings.groundHeight, 0, canvas.width/2, canvas.height, canvas.width);

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
	ctx.fillStyle = "#C4A54F";
	ctx.fillRect(0,canvas.height-gameSettings.groundHeight,canvas.width,gameSettings.groundHeight);

	// Texture
	ctx.fillStyle=groundPattern;
	ctx.fillRect(0,canvas.height-gameSettings.groundHeight,canvas.width,gameSettings.groundHeight);

	// Top line
	ctx.fillStyle = "#918830";
	ctx.fillRect(0,canvas.height-gameSettings.groundHeight,canvas.width,1);

	// Trees
	/*ctx.save();
	ctx.fillStyle=treePattern;
    ctx.translate(0, canvas.height-gameSettings.groundHeight-treeTexture.height);
	ctx.fillRect(0, 0, canvas.width, treeTexture.height);
	ctx.restore();*/

}

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
}