var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Battle = require("../models/battle");
var Spill = require("../models/spill");
var middle = require("../middleware/index");

router.get("/", function(req, res) {
   res.render("Battles/show"); 
});

router.post("/",function(req, res){
    var utfordrer = res.locals.currentUser;
    var motstander = req.body.motstander;
    var spillnavn = req.body.spill;
    var beskrivelse = "Battle: " + utfordrer.username.toString() + " vs " + motstander.toString();
    
    var battle = new Battle();
    
    battle.spill.name = spillnavn;
    battle.spill.beskrivelse = beskrivelse;
    battle.spill.tidspunkt  =  Date.now();
    console.log(battle.spill);
    
    User.findOne({"username": motstander}, function(err, user){
         if(err){
             console.log(err);
         } else {
             motstander = user;
             var spiller = {
                  id: req.user._id,
                  username: utfordrer.username
                };
    
             var motstander = {
                 id: motstander._id,
                 username: motstander.username
                };
                
            battle.spillere.push(spiller);
            battle.spillere.push(motstander);
            battle.save(function (err, data) {
                if (err){
                 console.log('Error on save!');
                }
                else{
                    console.log("=================");
                    console.log(battle.spillere);
                    console.log(data);
                    console.log("=================");
                    res.render("Battles/challenge", {battle: data});
                }
            });
            console.log("spilleren id er : " + spiller.id + " spilleren navn er : " + spiller.username )
            console.log("motstanderen id : " + motstander.id + " motstanderen username: " + motstander.username );
           
         }
   
     });
     
});
router.get("/new",middle.isLoggedIn, function(req,res){
    res.render("Battles/new");
});




module.exports = router; //exportert slik at den kan brukes i app.js