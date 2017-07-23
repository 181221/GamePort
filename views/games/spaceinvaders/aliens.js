function Alien(x,y){
	this.x = x;
	this.y = y;
	this.r = 30;
	this.xdir = 2.7;


	this.setXdir = function(dir){
		this.xdir = dir;
	}
	
	this.show = function(){
		fill(100,230,20);
		ellipseMode(CENTER);
		ellipse(this.x, this.y, this.r*2, this.r*2);

	}

	this.shiftDown = function(){
		this.xdir *= -1;
		this.y += this.r;
	}

	this.move = function(){
		this.x += this.xdir;
		
	}
	this.hits = function(ship){
		var d = dist(this.x, this.y, ship.x, ship.y);
		return d < this.r + ship.r;
	}
}