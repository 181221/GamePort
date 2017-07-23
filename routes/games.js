var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Battle = require("../models/battle");
var fs = require('fs');
var middleware = require("../middleware/index");

router.get("/:username/games" ,middleware.isLoggedIn ,function(req, res) {
  res.render("./games/gamesHome");
});

router.get("/:username/games/nyttspill", function(req, res) {
   res.render("./games/nyttspill/index"); 
});






router.get("/:username/games/spaceinvaders/:battleid/stats", function(req, res) {
    res.send(req.body);
});

router.post("/:username/games/spaceinvaders/:battleid/stats",function(req, res){
    
});
 
router.get("/games/spaceinvaders", function(req, res) {
    fs.readFile(__dirname + "/../" + "views/games/spaceinvaders/index", function(err, text){
        if(err){
            console.log(err);
        } else {
            res.send(text);
        }
        
    });
});


module.exports = router; //exportert slik at den kan brukes i app.js
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that!");//legger til flash. coden skal utføres før du redirecter!
    res.redirect("/login");
};

