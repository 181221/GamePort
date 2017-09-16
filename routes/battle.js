var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Battle = require("../models/battle");
var Spill = require("../models/spill");
var middle = require("../middleware/index");
var mongoose = require('mongoose');
/*
* Battle landing siden
* Viser landingsiden og om brukeren har fått nye utfordringer!
*/
router.get("/", middle.isLoggedIn, function(req, res) {
   var currentUser = res.locals.currentUser;
   var battleInfo = [];
   User.findById(currentUser).populate('utfordringer').where('utfordringer.ferdig').equals(false).exec(function (err, user) {
       if(err){
           console.log(err);
           req.flash("error", err.message);
           res.redirect("back");
       }else {
           var antall;
           var idArray = [];
           var utforderere = [];
           if(user){
                for(var i = 0; i < user.utfordringer.length; i++){
                    idArray[i] = user.utfordringer[i].id;
                    /*Battle.findById(user.utfordringer[i].id, function(err, battle) {
                       if(err){
                           console.log(err);
                       }else {
                           var motstander = battle.motstander.username;
                           var utfordrer = battle.utfordrer.username;
                           if(motstander === currentUser.username) {
                               utforderere.push(motstander)
                           }else {
                               utforderere.push(utfordrer);
                           }
                       }
                    });*/
                }
                antall = idArray.length;
           }else {
               antall = 0;
           }
           res.render("Battles/index", {antallUtfordringer: antall, utfordringer: user, idArray: idArray, battle: battleInfo, spillernavn: utforderere});
       }
   });
});

/*
* Oppretter ny battle mellom utfordrer og motspiller. Sender spilleren til arena.
* Pusher en utfordring til motstanderen. 
* Mongoose returnerer ikke objecter fra en funksjon, så alt må gjøres på denne ruten. 
* Til fremtidig utvikling av siden må jeg refactor dette her!
*/
router.post("/",function(req, res){
    var utfordrer = {
        id: req.user._id,
        username: res.locals.currentUser.username,
        ferdig: true
    };
    
    //lager spørring, må utføre alt inne spørringen, for å oppdaterer motstander id
    //spørring returnerer undefined.. derfor kan jeg ikke gjøre dette i en funksjon. 
    var query =  finnSpillerPaaUsername(req.body.motstander);
        query.exec(function(err,bruker){
     if(err || !bruker){
         console.log(err);
         req.flash("error", "Finner ikke brukeren")
         res.redirect("back");
     }else {
         var motstander = {
            id: bruker._id,
            username: req.body.motstander,
            ferdig: false
         };
         var spill = {
            navn: "SpaceInvaders",
            beskrivelse: utfordrer.username + " vs " + motstander.username
        };
        var nyBattle = {utfordrer: utfordrer, motstander: motstander, spill: spill, tidspunkt: Date.now()};
    
        Battle.create(nyBattle, function(err, battle){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                lagNyUtfordring(battle.utfordrer.id, battle._id);
                lagNyUtfordring(battle.motstander.id, battle._id);
                console.log("===========BATTLE============")
                console.log(battle);
                console.log("===========BATTLE=============")
                req.flash("success", "Ny Battle er Opprettet!");
                res.render("Battles/challenge", {battle: battle});
            }
        });
      } //else query
    }); //query
});

//Ny kamp
router.get("/new",middle.isLoggedIn, function(req,res){
    res.render("Battles/new");
});

/*
* Battle user history page.
* Return alle battler brukeren har spillt. 
*/ 
router.get("/history", middle.isLoggedIn, function(req, res) {
    var currentUser = res.locals.currentUser;
    Battle.find({$or:[ {'utfordrer.id': currentUser}, {'motstander.id': currentUser}]}).exec(function (err, battle) {
                if (err){
                    console.log(err.message);
                }else{
                    var battles = [];
                    for(var i = 0; i < battle.length; i ++){
                        if(battle[i].utfordrer.ferdig && battle[i].motstander.ferdig){
                            battles.push(battle[i]);
                        }
                    }
                    console.log("===========BATTLES AV CURRENTUSER=============");
                    console.log(battle.length);
                    if(battle.length > 0) {
                        res.render("Battles/show", {battle: battle});
                    }else {
                        req.flash("error","Du har ingen Battles, challenge en spiller!")
                        res.redirect("back");
                    }
                    
                }
    });
});

/*
* Brukeren sin show route. 
* henter alle spill som spilleren har spilt. Spilleren skal få full oversikt over kampene sine.
* Uspilte kamper skal kunne bli spilt herfra.
*/
router.get("/user/:player_id",function(req, res){
    var currentUser = req.params.player_id;
        Battle.find({$or:[ {'utfordrer.id': currentUser}, {'motstander.id': currentUser}]}).exec(function (err, battle) {
                if (err){
                    console.log("skjer en feil på battle/spiller_id i battle ruten");
                    console.log(err.message);
                }else{
                    res.render("Battles/show", {battle: battle});
                }
    });
});


/*
* Get battle_Id/player_Id. Etter at motstander har fått utfordring skal brukeren bli redirected ut hvor han skal spille.
*/
router.get("/:battle_id/:player_id", function(req, res) {
    Battle.findById(req.params.battle_id, function(err, battle) {
      if(err){
          console.log("feil fra battle id/playerid i battle ruten")
          console.log(err.message);//skjer en feil her når spille render battle/new
      } else{
            req.flash("sucess", "battle is about to begin");
            res.render("Battles/challenge", {battle: battle});
        }
    });
});


/* 
*  Updater scoren til spilleren som har utfordret til kamp. 
*  Oppdaterer utfordringer til spilleren.
*  Utfordrer kommer til denne ruten etter utfordrer har lagd ny battle og spillt den.
*/
router.put("/:battle_id/:player_id",function(req,res){
    var currentSpiller = req.params.player_id;
    Battle.findById(req.params.battle_id, function(err,battle){
       if(err){
           console.log(err.message);
       }else{
            if(battle.utfordrer.id.equals(currentSpiller)){
               console.log("utfordrer er ferdig!")
               battle.utfordrer.ferdig = true;
               battle.utfordrer.score = req.body.score;
               finnBrukerOgOppdaterTotalScore(currentSpiller, req.body.score);
           }else {
               console.log("motstander e ferdig!")
               battle.motstander.ferdig = true;
               battle.motstander.score = req.body.score;
               console.log(battle.motstander.id)
               finnBrukerOgOppdaterTotalScore(battle.motstander.id, req.body.score);
           }
           finnBrukerOgSlettUtfordring(currentSpiller,req.params.battle_id);
           battle.save(); //lagrer battle
           req.flash("success", "battle updated!");
           res.redirect("/battle/"+ req.params.battle_id +"/user/" + battle.utfordrer.username + "/vs/" + battle.motstander.username);
       }
   }) 
});

router.post("/:currentuserId/:battleId/", function(req, res) {
    var godta = req.body.godta; 
    var slett = req.body.slett;
    var battleid = req.params.battleId;
    var user = req.params.currentuserId;
    console.log("slett" + slett + "   godta : " + godta);
    var motstander = finnMotstanderen(battleid, user, res);
}); 

router.get("/:battle_id/user/:username/vs/:username", function(req, res) {
   Battle.findById(req.params.battle_id, function(err, battle) {
       if(err){
           console.log(err.message);
           req.flash("error", err.message);
       }else {
           console.log("========");
           console.log(battle);
           req.flash("success", "Battle Complete!");
           res.render("Battles/stats", {battle:battle});
       }
   }) 
});
function finnMotstanderen(battleid, currentUser, res) {
    var motstander;
    Battle.findById(battleid, function(err, battle) {
        motstander = battle.motstander.id;
        if(err) {
            console.log(err);
        }else {
            if(motstander.equals(currentUser)) {
                console.log("currentuser = " + currentUser)
                motstander = battle.utfordrer.id;
            }else {
                console.log("motstander funnet! " + motstander);
            }
            finnBrukerOgSlettUtfordring(motstander, battleid);
            finnBrukerOgSlettUtfordring(currentUser, battleid);
            res.redirect("/back");
        }
    });
};

/*
* Slett utfordring
*/
function finnBrukerOgSlettUtfordring(userId, battleId){
    User.findById(userId).populate('utfordringer').where('utfordringer.id').equals(battleId).exec(function(err, user){
       if(err || !user){
           console.log(err);
           return;
       } else {
           var funnet = false;
           for(var i = 0; i < user.utfordringer.length && !funnet; i++){
               if(user.utfordringer[i].id.equals(battleId)){ // sletter utfordringen 
                   user.utfordringer.pull({ _id: user.utfordringer[i]._id }); //funker bare på _id
                   user.save();
                   funnet = true;
               }
           }
           return;
       }
    });
}

function finnBattlePaaId(battle_id){
    Battle.findById(battle_id, function(err, battle) {
        if(err){
            console.log(err.message);
        }else {
            battleUtfordrer = battle.utfordrer.username;
            return battle;
        }
    });
   
}

/*
* Finn brukeren og oppdater totalscoren.
*/
function finnBrukerOgOppdaterTotalScore(userId, score){
    User.findById(userId, function(err, user) {
       if(err){
           console.log(err);
       } else {
           var scoren = Number(score);
           var poeng;
           if(score >= 0 && score < 200){
               poeng = 2;
               user.totalscore += poeng;
           } else if(score >= 200 && score < 500) {
               user.totalscore = 9;
           } else if(score >= 500 && score < 1000){
               poeng = 20;
               user.totalscore += poeng;
           }else {
               user.totalscore += 30;
           }
           //user.totalscore += scoren;
           user.save();
           console.log(user.totalscore);
           return;
       }
    });
};

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
            return;
       }
    });
}

function finnSpillerPaaUsername(username){
   var query = User.findOne({"username":username});
   return query;
}

module.exports = router; //exportert slik at den kan brukes i app.js