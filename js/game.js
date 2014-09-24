
/**************
	GLOBALS
**************/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var TO_RADIANS = Math.PI/180;

var imageObj = new Image();
imageObj.src = 'assets/plane.png';

var bullets = [];

/****************
	GAME TICK
****************/

gameTick.run(tick);

function tick(elapsed){

	// Location/Velocity/AI
	aircraft.move(elapsed);

	player2.move(elapsed);

	// Drawings
	clearCanvas();
	draw();

}

// This is my aircraft, there are many like it but this one is mine
var aircraft = {
	name: "TF-DESTROYER",
	x: 300, // Horizontal position
	y: 200, // Vertical position
	velX: 0, // Horizontal velocity
	velY: 0, // Vertical velocity
	power: 20, // Max engine output
	drag: 0.125, // Drag coefficient
	lift: 0.7, // Lift coefficient
	direction: 0, // 360° direction

	engineOn: false, // booleans that control movement
	turnCW: false, // Is turning clockwise
	turnCCW: false, // Is turning counter clockwise

	draw: function(){
		drawRotatedImage(imageObj, this.x, this.y, this.direction, 0.5);
	},
	move: function(elapsed){

		var gravity = {
			earth:9.81,
			mars:3.711,
			moon:1.622
		};

		// Gravity
		this.velY += gravity.earth * elapsed;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Aircraft lift - simple variation, not accurate
		this.velY -= Math.abs(this.velX * this.lift * elapsed);

		// Change direction
		if (this.turnCW) {
			this.direction += 360 * elapsed;
		};
		if (this.turnCCW) {
			this.direction -= 360 * elapsed;
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
		if (this.y >= canvas.height) {
			this.y = canvas.height-1;
			this.velY = -this.velY * 0.75;
		};


		this.y = Math.min(this.y + this.velY, canvas.height);
		this.x = Math.min(this.x + this.velX, canvas.width);
	},
	keyHandler: function(key, state){
		switch(key){
			case 'w':
				this.engineOn = state;
			break;
			case 'a':
				this.turnCCW = state;
			break;
			case 'd':
				this.turnCW = state;
			break;
		}
	}
};

// This is my aircraft, there are many like it but this one is mine
var player2 = {
	name: "TF-DAÐI",
	x: 300, // Horizontal position
	y: 600, // Vertical position
	velX: 0, // Horizontal velocity
	velY: 0, // Vertical velocity
	power: 15, // Max engine output
	drag: 0.25, // Drag coefficient
	lift: 0.75, // Lift coefficient
	direction: 0, // 360° direction

	engineOn: false, // booleans that control movement
	turnCW: false, // Is turning clockwise
	turnCCW: false, // Is turning counter clockwise

	draw: function(){
		drawRotatedImage(imageObj, this.x, this.y, this.direction, 0.5);
	},
	move: function(elapsed){

		var gravity = {
			earth:9.81,
			mars:3.711,
			moon:1.622
		};

		// Gravity
		this.velY += gravity.earth * elapsed;

		// Drag coefficient
		this.velX = bringToZero(this.velX, (Math.pow(this.velX, 2) * this.drag * elapsed));
		this.velY = bringToZero(this.velY, (Math.pow(this.velY, 2) * this.drag * elapsed));

		// Aircraft lift - simple variation, not accurate		
		this.velY -= Math.abs(this.velX * this.lift * elapsed);

		// Change direction
		if (this.turnCW) {
			this.direction += 360 * elapsed;
		};
		if (this.turnCCW) {
			this.direction -= 360 * elapsed;
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
		if (this.y >= canvas.height) {
			this.y = canvas.height-1;
			this.velY = -this.velY * 0.75;
		};


		this.y = Math.min(this.y + this.velY, canvas.height);
		this.x = Math.min(this.x + this.velX, canvas.width);
	},
	keyHandler: function(key, state){
		switch(key){
			case 'w':
				this.engineOn = state;
			break;
			case 'a':
				this.turnCCW = state;
			break;
			case 'd':
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
			this.direction += 360 * elapsed;
		};
		if (this.turnCCW) {
			this.direction -= 360 * elapsed;
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
		if (this.y >= canvas.height) {
			this.y = canvas.height-1;
			this.velY = -this.velY * 0.75;
		};


		this.y = Math.min(this.y + this.velY, canvas.height);
		this.x = Math.min(this.x + this.velX, canvas.width);
	};
};


/***********************
	HELPER FUNCTIONS
***********************/

function drawRotatedImage(image, x, y, angle, scale){
    // save the current co-ordinate system 
    // before we screw with it
    ctx.save(); 

    // move to the middle of where we want to draw our image
    ctx.translate(x, y);

    // rotate around that point, converting our 
    // angle from degrees to radians 
    ctx.rotate(angle * TO_RADIANS);

    // draw it up and to the left by half the width
    // and height of the image 
    ctx.drawImage(image, -(image.width/2) * scale, -(image.height/2) * scale, image.width * scale, image.height * scale);

    // and restore the co-ords to how they were when we began
    ctx.restore(); 
}

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
    'a': function() { aircraft.keyHandler('a', true); },
    'd': function() { aircraft.keyHandler('d', true); },
    'w': function() { aircraft.keyHandler('w', true); }
}, 'keydown');

Mousetrap.bind({
    'a': function() { aircraft.keyHandler('a', false); },
    'd': function() { aircraft.keyHandler('d', false); },
    'w': function() { aircraft.keyHandler('w', false); }
}, 'keyup');

// Player 2
Mousetrap.bind({
    'left': function() { player2.keyHandler('a', true); },
    'right': function() { player2.keyHandler('d', true); },
    'up': function() { player2.keyHandler('w', true); }
}, 'keydown');

Mousetrap.bind({
    'left': function() { player2.keyHandler('a', false); },
    'right': function() { player2.keyHandler('d', false); },
    'up': function() { player2.keyHandler('w', false); }
}, 'keyup');

/***********************
	AIRCRAFT UPDATES
***********************/



/***********************
	RENDERING ENGINE	
***********************/

function draw(){
	aircraft.draw();
	player2.draw();
}

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
}