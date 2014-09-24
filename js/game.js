
/**************
	GLOBALS
**************/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var TO_RADIANS = Math.PI/180;

var imageObj = new Image();
imageObj.src = 'assets/cursor.png';

/****************
	GAME TICK
****************/

gameTick.run(tick);

function tick(elapsed){

	// Location/Velocity/AI
	aircraft.move(elapsed);


	// Drawings
	clearCanvas();
	draw();

}


// This is my aircraft, there are many like it but this one is mine
var aircraft = {
	name: "TF-DESTROYER",
	x: 300,
	y: 200,
	velX: 0,
	velY: 0,
	speed: 20,
	drag: 0.4,
	direction: 0,

	engineOn: false, // booleans that control movement
	turnCW: false,
	turnCCW: false,

	draw: function(){
		drawRotatedImage(imageObj, this.x, this.y, this.direction);
	},
	move: function(elapsed){

		// Gravity
		this.velY += 9.81 * elapsed;

		// Air resistance
		this.velX -= this.velX * (this.drag * elapsed);
		this.velY -= this.velY * (this.drag * elapsed);

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

			var x = Math.cos(angle);
			var y = Math.sin(angle);

			this.velX += this.speed * x * elapsed;
			this.velY += this.speed * y * elapsed;
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

/***********************
	HELPER FUNCTIONS
***********************/

function drawRotatedImage(image, x, y, angle)
{ 
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
    ctx.drawImage(image, -(image.width/2), -(image.height/2));

    // and restore the co-ords to how they were when we began
    ctx.restore(); 
}

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