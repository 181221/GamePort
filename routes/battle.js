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
    Battle.find({}).populate({
             path: 'spillere',
             }).where('spillere.id').equals(currentUser.id).exec(function (err, battle) {
                if (err){
                    console.log(err);
                }else{
                    console.log("===========UTFORDRINGER");
                    var utfordringBattleId = [];
                    console.log(battle[0]);
                    console.log(battle[0].spillere[0]);
                    console.log(battle[0].spillere[1]);
                    for(var i = 0; i < battle.length;i++){
                        if(!battle[i].ferdig){
                            utfordringBattleId.push(battle[i].id);
                            console.log(battle[i].id);
                        }
                    }
                    console.log("===========UTFORDRINGER");
                    var antall = utfordringBattleId.length;
                    console.log(antall);
                    res.render("Battles/index", {antallUtfordringer: antall, battleId: utfordringBattleId});
                }
    });
    
    
    // User.findById(currentUser.id).populate("utfordringer").exec(function (err, user) {
    //             if (err){
    //                 console.log(err);
    //             }else{
    //                 console.log("===========UTFORDRINGER");
    //                 var utfordringBattleId = [];
    //                 var spiller = user.utfordringer;
    //                 for(var i = 0; i < spiller.length;i++){
    //                     if(!spiller[i].ferdig){
    //                         utfordringBattleId.push(spiller[i].id);
    //                         console.log(spiller[i].id);
    //                     }
    //                 }
    //                 console.log("===========UTFORDRINGER");
    //                 var antall = utfordringBattleId.length;
    //                 console.log(antall);
                    
    //                 res.render("Battles/index", {antallUtfordringer: antall, battleId: utfordringBattleId} );
    //             }
    // });
});

/*
* Ny utfordring
*/
function lagNyUtfordring(userId, battleId){
    User.findById(userId, function(err, user) {
       if(err){
           console.log(err);
       } else {
           var nyUtfordring = {
                id: battleId,
                ferdig: false
            }
            user.utfordringer.push(nyUtfordring)
            user.save();
            console.log(user);
            return;
       }
    });
}

function finnSpillerPaaUsername(username){
   var query = User.findOne({"username":username});
   return query;
}

/*
* Oppretter ny battle mellom utfordrer og motspiller. Sender spilleren til arena.
* Pusher en utfordring til motstanderen. 
* Mye som consolelog som må fjernes. 
*/
router.post("/",function(req, res){
    var utfordrer = {
        id: req.user._id,
        username: res.locals.currentUser.username,
        ferdig: true
    };
    
    //lager spørring må utføre alt inne spørringen, for å oppdaterer motstander id
    //spørring returnerer undefined..
    var query =  finnSpillerPaaUsername(req.body.motstander);
        query.exec(function(err,bruker){
     if(err){
         console.log(err);
     }else {
         var motstander = {
            id: bruker._id,
            username: req.body.motstander,
            ferdig: false
         };
         var spill = {
            navn: req.body.spill,
            beskrivelse: utfordrer.username + " vs " + motstander.username
        };
        var nyBattle = {utfordrer: utfordrer, motstander: motstander, spill: spill, tidspunkt: Date.now()};
    
        Battle.create(nyBattle, function(err, battle){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log("===========BATTLE============")
                console.log(battle);
                console.log("===========BATTLE=============")
                lagNyUtfordring(battle.utfordrer.id, battle._id);
                lagNyUtfordring(battle.motstander.id, battle._id);
                req.flash("success", "Ny Battle er Opprettet!");
                res.render("Battles/challenge", {battle: battle});
            }
        });
      }//else querry
    }); //querry
});
/*
* Get battleid/playerid, motstander skal spille sin kamp 
* 
*/
router.get("/:battle_id/:player_id", function(req, res) {
    Battle.findById(req.params.battle_id, function(err, battle) {
       if(err){
           console.log(err);
       } else{
            req.flash("sucess", "battle is about to begin");
            res.render("Battles/challenge", {battle: battle});
        }
    });
});

//hent spiller fra database og oppdater utfordringen 
function soekSpiller(battleid, userid){
    User.findById(userid).populate('utfordringer').where('utfordringer.id').equals(battleid).exec(function (err, spiller) {
    
        
    });
};

/* Updater scoren til spilleren som har utfordret til kamp. 
*  Oppdaterer utfordringer til spilleren.
*  Utfordrer kommer til denne ruten etter utfordrer har lagd ny battle og spillt den.
*/
router.put("/:battle_id/:player_id",function(req,res){
    var battleId = req.params.battle_id;
    console.log("scoren er " + req.body.score);
    Battle.findById(req.params.battle_id, function(err,battle){
       if(err){
           console.log(err);
       }else{
           var currentSpiller = req.params.player_id;
           if(currentSpiller === battle.utfordrer.id){
               battle.utfordrer.ferdig = true;
           }else {
               battle.motstander.ferdig = true;
           }
           battle.save(); //lagrer battle
           req.flash("success", "battle updated!");
           res.redirect("/battle/" + currentSpiller);
          
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
* 
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