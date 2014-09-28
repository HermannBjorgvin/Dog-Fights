
/**************
	GLOBALS
**************/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var TO_RADIANS = Math.PI/180;

var planeSpritesheet = new Image();
planeSpritesheet.src = 'assets/plane.png';

var bullets = [];

/****************
	GAME TICK
****************/

gameTick.run(tick);

function tick(elapsed){

	// Location/Velocity/AI
	aircraft.fly(elapsed);

	// Drawings
	clearCanvas();
	draw();

}

var gameSettings = {
	groundHeight: 40
}

// This is my aircraft, there are many like it but this one is mine
var aircraft = {
	name: "TF-DESTROYER",
	x: 300, // Horizontal position
	y: 200, // Vertical position
	velX: 0, // Horizontal velocity
	velY: 0, // Vertical velocity
	
	power: 16, // Max engine output
	drag: 0.3, // Drag coefficient
	lift: 1.2, // Lift coefficient
	direction: 0, // 360° direction

	engineOn: false, // booleans that control movement
	turnCW: false, // Is turning clockwise
	turnCCW: false, // Is turning counter clockwise
	primaryWeapon: false, // Primary weapon 

	draw: function(){
		//drawRotatedImage(planeSpritesheet, this.x, this.y, this.direction, 0.5);

		var scale = 0.5;
		var angle = this.direction % 360;
		var x = Math.cos(angle * TO_RADIANS);
		var y = Math.sin(angle * TO_RADIANS);
		
		var frameNumber = 4;
		var frame = Math.round(Math.abs(x * (frameNumber-1)));

		var img = planeSpritesheet;
		var frameWidth = 68;
		var frameHeight = img.height;

		ctx.save();
		ctx.translate(this.x, this.y);
    	ctx.rotate(angle * TO_RADIANS);

		ctx.drawImage(img, frameWidth*frame, 0, frameWidth, frameHeight, -(frameWidth/2) * scale, -(frameHeight/2) * scale, frameWidth * scale, frameHeight * scale);


		ctx.restore();

	},
	fly: function(elapsed){
		
		var angle = this.direction % 360;

		var gravity = {
			earth:9.81,
			mars:3.711,
			moon:1.622
		};

		// Gravity
		this.velY += gravity.earth * 0.5 * elapsed;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Ground drag

		// Aircraft lift - simple variation, not accurate
		// this.velY -= Math.abs(Math.cos(angle * TO_RADIANS) * this.velX * this.lift * elapsed);

		// Change direction
		if ((this.turnCW || this.turnCCW) && !(this.turnCW && this.turnCCW)) {
			var turnRadius = 0.6;
			if (this.engineOn) {
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

		// Bounding box - Got to find a better bounding box		
		if (this.x >= canvas.width) {
			this.x = 0;
		};
		if (this.x < 0) {
			this.x = canvas.width;
		};

		// Aircraft top/bottom borders
		if (this.y < 0) {
			this.velY += Math.pow(this.y, 2) * elapsed;
		};

		this.y = Math.min(this.y + this.velY, canvas.height);
		this.x = Math.min(this.x + this.velX, canvas.width);
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
				this.turnCW = state;
			break;
		}
	}
};

// This is my aircraft, there are many like it but this one is mine
function bullet_constructor(){
	x: 300; // Horizontal position
	y: 200; // Vertical position
	velX: 0; // Horizontal velocity
	velY: 0; // Vertical velocity
	power: 80; // Max engine output
	drag: 0.0125; // Drag coefficient
	direction: 0; // 360° direction

	draw = function(){
		drawRotatedImage(imageObj, this.x, this.y, this.direction, 0.5);
	};
	move = function(elapsed){

		this.radius = 5;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Aircraft lift - simple variation, not accurate
		this.velY -= this.velX * this.lift * elapsed;

		// Change direction
		if (this.turnCW) {
			this.direction += 360 * elapsed * 0.5;
		};
		if (this.turnCCW) {
			this.direction -= 360 * elapsed * 0.5;
		};
		//console.log(this.direction);

		// Add engine velocity
		if (this.engineOn) {
			var angle = this.direction % 360;

			var x = Math.cos(angle * TO_RADIANS);
			var y = Math.sin(angle * TO_RADIANS);

			this.velX += this.power * x * elapsed;
			this.velY += this.power * y * elapsed;
		};

		// Bounding box - Got to find a better bounding box		
		if (this.x >= canvas.width) {
			this.x = 0;
		};
		if (this.x < 0) {
			this.x = canvas.width;
		};
		if (this.y >= canvas.height-100) {
			this.y = canvas.height-101;
			this.velY = -this.velY * 0.75;
		};

		this.y = Math.min(this.y + this.velY, canvas.height);
		this.x = Math.min(this.x + this.velX, canvas.width);
	};
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

function draw(){
	aircraft.draw();
}

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
}