
// This is my rifle, there are many like it but this one is mine
function bombConstructor(x_coords, y_coords, x_vel, y_vel, direction){
	this.active = 1;
	this.x = x_coords; // Horizontal position
	this.y = y_coords; // Vertical position
	this.velX = x_vel; // Horizontal velocity
	this.velY = y_vel; // Vertical velocity
	this.power = 4; // Max engine output
	this.drag = 0.6; // Drag coefficient
	this.direction = direction; // 360° direction
	this.radius = 5;
	this.age = 0;
	this.maxAge = 3;
	this.initialized = 0;

	this.draw = function(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#000';
		ctx.fill();
	};
	this.iterate = function(elapsed){

		// Velocity calculation from angle and power
		var angle = this.direction % 360;
		var x = Math.cos(angle * TO_RADIANS);
		var y = Math.sin(angle * TO_RADIANS);
		this.velX += this.power * x * elapsed;
		this.velY += this.power * y * elapsed;

		if (this.initialized != 1) {
			this.velX += this.power * x;
			this.velY += this.power * y;
			this.initialized = 1;
		};

		// Bounding box - Got to find a better bounding box		
		if (this.x >= canvas.width) {
			this.x = 0;
		};
		if (this.x < 0) {
			this.x = canvas.width;
		};
		if (this.y > canvas.height-gameSettings.groundHeight) {
			this.active = 0;
		};

		this.y = this.y + this.velY;
		this.x = this.x + this.velX;

		this.age += elapsed;
		if (this.age >= this.maxAge) {
			this.active = 0;
		};
	};
};