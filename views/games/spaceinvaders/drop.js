
function Drop(x,y) {
	this.x = x;
	this.y = y;
	this.r = 8;

	this.show = function(){
		fill(100,255,200);
		noStroke();
		ellipse(this.x, this.y, this.r*2, this.r*2);
	}
	this.move = function(){
		this.y = this.y - 7;
	}
	this.hits = function(alien){
		var d = dist(this.x, this.y, alien.x, alien.y);
		return d < this.r + alien.r;
	}
}