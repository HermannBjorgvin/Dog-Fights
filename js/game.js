
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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
	x: 20,
	y: 20,
	velX: 0,
	velY: 0,
	speed: 100,
	engineOn : false,

	turnCW: false, // booleans that controll rotation
	turnCCW: false,

	draw: function(){
		ctx.fillStyle = '#000';
		ctx.fillRect(this.x, this.y, 20, 20);
	},
	move: function(elapsed){
		this.velY += 9.81 * elapsed;

		this.y += this.velY;
	},
	turn
};

/***********************
	AIRCRAFT CONTROL
***********************/
Mousetrap.bind({
    'a': function() { console.log('a DOWN'); },
    'd': function() { console.log('d DOWN'); }
}, 'keydown');

Mousetrap.bind({
    'a': function() { console.log('a UP'); },
    'd': function() { console.log('d UP'); }
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