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
* Ny spiller
*/
function opprettSpiller(userId, username, ferdig){
    var spiller = {
        id: userId,
        username: username,
        ferdig: ferdig
    };
    return spiller;
}

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
            console.log("=======BRUKER======");
            console.log(user);
            console.log("=======BRUKER======");
            return;
       }
    });
}
/*
* Oppretter ny battle mellom utfordrer og motspiller. Sender spilleren til arena.
* Pusher en utfordring til motstanderen. 
* Mye som consolelog som må fjernes. 
*/
//refactor
// router.post("/",function(req, res){
//     var utfordrer = res.locals.currentUser;
//     var motstander = req.body.motstander;
//     var spillnavn = req.body.spill;
//     var beskrivelse = "Battle: " + utfordrer.username.toString() + " vs " + motstander.toString();
//     var battle = new Battle();
    
//     battle.spill.name = spillnavn;
//     battle.spill.beskrivelse = beskrivelse;
//     battle.spill.tidspunkt  =  Date.now();
    
//     //Oppretter to spiller . 
//     var challenger = opprettSpiller(req.user._id, utfordrer.username); 
//     var opponent = opprettSpiller(motstander._id, motstander); 
    
//     //Pusher dem til battle skjema  
//     battle.spillere.push(challenger);
//     battle.spillere.push(opponent);
    
//     //Pusher ny utfordring til utfordrer 
//     lagNyUtfordring(req.user._id, battle._id);
    
//     //pusher ny utfordring til motstander
//     lagNyUtfordring(motstander._id, battle._id);
    
//     //lagrer skjemaet
//     battle.save(function(err, battle){
//         if(err){
//           console.log(err);
//         }else{
//           res.render("Battles/challenge", {battle: battle});
//         }
//     });
// });

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
    
    //lager spørring
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
                if (err){
                    console.log(err);
                }else{
                    console.log("====FRA SPILLER====")
                    //får en array tilbake med alle utfordringene.. finner ikke ut hvordan jeg får den riktige
                    //iterer bare gjennom alle å finner riktig derfra.
                    console.log(spiller);
                    // for(var i = 0; i < spiller.utfordringer.length; i++){
                    //     if(spiller.utfordringer[i].id.equals(battleid)){ //setter til ferdig og saver. 
                    //         spiller.utfordringer[i].ferdig = true;
                    //         spiller.save();
                    //         return;
                    //     }
                    // }
                }
    });
};

/* Updater scoren til spilleren som har utfordret til kamp. 
*  Oppdaterer utfordringer til spilleren.
*/
router.put("/:battle_id/:player_id",function(req,res){
    var battleId = req.params.battle_id;
    console.log("scoren er " + req.body.score);
    Battle.findById(req.params.battle_id, function(err,battle){
       if(err){
           console.log(err);
       }else{
           var currentSpiller = req.params.player_id;
           console.log(currentSpiller === String(battle.spillere[0].id));
           var riktigIndex = riktigSpiller(currentSpiller, battle.spillere[0].id)
           console.log("riktigindex: " + riktigIndex)
           console.log("utforderer: " + battle.spillere[0].username);
           console.log("motstander: " + battle.spillere[1].username);
           battle.spillere[riktigIndex].score = req.body.score; //sender inn score fra form.
           battle.spillere[riktigIndex].ferdig = true;
          
           battle.save(); //lagrer battle
            console.log(battle.spillere[1].ferdig);
            console.log(battle.spillere[0].ferdig);
           req.flash("success", "battle updated!");
           res.redirect("/battle/" + currentSpiller);
          
       }
   }) 
});
function riktigSpiller(currentSpiller, foersteSpiller){
    if(currentSpiller === String(foersteSpiller)){
        return 0;
    }else{
        return 1;
    }
}

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