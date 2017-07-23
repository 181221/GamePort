
var ship;
var drops = [];
var aliens = [];
var fjernes;
var edge;
var score;
var myP;
var level;
var gameover;
function levelUp(){
  for(var i = 0; i < 7;i++){
    aliens[i] = new Alien(i*80+60,40);
    aliens[i].setXdir(Number(level));
  }
}


function setupAliens() {
  for(var i = 0; i < 7;i++){
    aliens[i] = new Alien(i*80+60,40);
  }
  window.addEventListener("keydown", function(){
    if(keyCode === 32){
      drops.push(new Drop(ship.x, height));
    } else if(keyCode === 37) {
      ship.setDir(-1);
    }else if(keyCode === 39){
      ship.setDir(1);
    }
  });
  
}


function setup() {
  level = 0;
  score = 100;
  gameover = false;
  myP = createP(score);
  myP.id()
  myP.parent("scoren");
  
  var myCanvas = createCanvas(600,400);
 	myCanvas.parent("minContainer");
  
	
  ship = new Ship();
  
  setupAliens();
  
  var vinner = function(){
    createCanvas(600,400);
    
  }

 
  //myP.position(70,25);
  
}//setup
function gameOver() {
  createCanvas(600,400);
  background(41);
}

function draw() {
  if(gameover){
    remove();
    gameOver();
    background(41);
    
  }
  edge = false;
  shipEdge = true
	background(41);
  fjernes = false;
  ship.show();
  ship.move();
  
  
  myP.html(score);
  
  for(var i = 0; i < drops.length && !fjernes; i++){
    drops[i].show();
    drops[i].move();
      for(var j = 0; j < aliens.length && !fjernes; j++){
        if(drops[i].hits(aliens[j])){
          aliens.splice(j,1);
          drops.splice(i,1);
          fjernes = true;
          score+=3;
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
      if(aliens[i].hits(ship)){
        gameover = true;
      }
  }

  for(var i = 0; i < aliens.length;i++){
    if(edge){
      aliens[i].shiftDown();
    }
  }
  if(aliens.length === 0){
    level+=1;
    levelUp();
    
  }

}//draw


//overrode function p5, laget en lytter!
// function keyReleased(){
//   if(keyCode != 32 && keyCode != RIGHT_ARROW && keyCode !=LEFT_ARROW){
//     ship.setDir(0);
//   }
	
// }
//override function, laget en lytter!

  