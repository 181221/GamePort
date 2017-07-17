var ship;
var drops = [];
var aliens = [];
var fjernes;
var edge;


function setup() {
	var myCanvas = createCanvas(600,400);
  ship = new Ship();
  for(var i = 0; i < 7;i++){
    aliens[i] = new Alien(i*80+60,40);
  }
  window.addEventListener("keydown", function(){
    if(keyCode === 32){
      drops.push(new Drop(ship.x, height));
      console.log("space");
    } else if(keyCode === 37) {
      ship.setDir(-1);
    }else if(keyCode === 39){
      ship.setDir(1);
    }
  });
}//setup

function draw() {
  edge = false;
	background(41);
  
  ship.show();
  ship.move();

  for(var i = 0; i < drops.length; i++){
    drops[i].show();
    drops[i].move();
      for(var j = 0; j < aliens.length && !fjernes; j++){
        if(drops[i].hits(aliens[j])){
          drops.splice(i,1);
          fjernes = true;
        }
      } 
    }
  edge = false;

  for(var i = 0; i < aliens.length; i++){
     aliens[i].show();
     aliens[i].move(); 
     
     if(aliens[i].x + aliens[i].r > width || aliens[i].x + aliens[i].r < 60){
        edge = true;
      }
  }

  for(var i = 0; i < aliens.length;i++){
    if(edge){
      aliens[i].shiftDown();
    }
  }

}//draw


//overrode function p5, laget en lytter!
// function keyReleased(){
//   if(keyCode != 32 && keyCode != RIGHT_ARROW && keyCode !=LEFT_ARROW){
//     ship.setDir(0);
//   }
	
// }
//override function, laget en lytter!

  