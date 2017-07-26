var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Battle = require("../models/battle");
var Spill = require("../models/spill");
var middle = require("../middleware/index");
var mongoose = require('mongoose');

//Battle landing page. 
router.get("/", middle.isLoggedIn, function(req, res) {
    var currentUser = res.locals.currentUser;
    console.log("current userid er " + currentUser.id);
    
    
    User.findById(currentUser.id).populate("utfordringer").exec(function (err, user) {
                if (err){
                    console.log(err);
                }else{
                    console.log("===========UTFORDRINGER");
                    var utfordringBattleId = [];
                    var spiller = user.utfordringer;
                    for(var i = 0; i < spiller.length;i++){
                        if(!spiller[i].ferdig){
                            utfordringBattleId.push(spiller[i].id);
                            console.log(spiller[i].id);
                        }
                    }
                    console.log("===========UTFORDRINGER");
                    var antall = utfordringBattleId.length;
                    console.log(antall);
                    
                    res.render("Battles/index", {antallUtfordringer: antall, battleId: utfordringBattleId} );
                }
    });
});

/*
* Oppretter ny battle mellom utfordrer og motspiller. Sender spilleren til arena.
* Pusher en utfordring til motstanderen. 
* Mye som consolelog som må fjernes. 
*/
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
             //Oppretter to spiller og pusher dem til battle skjema. 
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
             
             //Lagrer skjemaet
             battle.save(function (err, data) {
                if (err){
                 console.log('Error on save!');
                }
                else{
                    //Pusher ny utfordring til motstanderen 
                    var nyUtfordring = {
                     id: battle._id,
                     ferdig: false
                  };
                       user.utfordringer.push(nyUtfordring);
                       user.save();
                       
                    //console.log dritt som skal vekk.
                    console.log("fra nybattle ruten motstander.battle.id = : " + user.utfordringer[0].id);
                    console.log("battle iden er ==== " + data._id )
                    console.log("=================");
                    console.log(battle.spillere);
                    console.log(data);
                    console.log("=================");
                
                    //rendrer og sender data til challenge.ejs filen. 
                    res.render("Battles/challenge", {battle: data});
                    }
                });
            //skal fjernes
            console.log("spilleren id er : " + spiller.id + " spilleren navn er : " + spiller.username )
            console.log("motstanderen id : " + motstander.id + " motstanderen username: " + motstander.username );
           
         }
     });
});
/* Updater scoren til spilleren som har utfordret til kamp. 
*  Oppdaterer utfordringer til spilleren.
*/
router.put("/:battle_id/:player_id",function(req,res){
    var battleId = req.params.battle_id;
    Battle.findById(req.params.battle_id, function(err,found){
       if(err){
           console.log(err);
       }else{
           var currentSpiller = req.params.player_id;
           console.log("utforderer: " + found.spillere[0].username);
           console.log("motstander: " + found.spillere[1].username);
           found.spillere[0].score = 10; //må sende inn score fra form.
           found.save(); //lagrer battle
           User.findById(currentSpiller,function(err, user){ //søker etter currentspiller. 
               if(err){
                   console.log(err);
               }else {
                   //currentspiller skal alltid ligge på plass en fra redirect. 
                   var nyUtfordring = {
                     id: battleId,
                     ferdig: true
                  };
                  user.utfordringer.push(nyUtfordring);
                  console.log(user.utfordringer[0].ferdig);
                  req.flash("success", "battle updated!");
                  res.redirect("/battle/" + currentSpiller);
               }
           });
       }
   }) 
});

//Ny kamp
router.get("/new",middle.isLoggedIn, function(req,res){
    res.render("Battles/new");
});
/*
* Brukeren sin show route. 
* henter alle spill som spilleren har spilt. Spilleren skal få full oversikt over kampene sine.
* Uspilte kamper skal kunne bli spilt herfra.
*/
router.get("/:player_id",function(req, res){
        Battle.find({}).populate({
             path: 'spillere',
             }).where('spillere.id').equals(req.params.player_id).exec(function (err, battle) {
                if (err){
                    console.log(err);
                }else{
                    res.render("Battles/show", {battle:battle});
                }
    });
});


module.exports = router; //exportert slik at den kan brukes i app.js