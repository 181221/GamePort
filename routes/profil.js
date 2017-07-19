var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");


router.get("/:username", function(req, res){
    User.find({ username: req.params.username }, function(err, funnetBruker){
        if(err){
            req.flash("error", err.message);
            res.redirect("/");
        } else {
            res.render("./brukere/show", {brukeren: funnetBruker});
        }
    });
});

router.get("/:username/settings", middleware.isLoggedIn, function(req,res){
    var reqbruker = req.params.username; 
    var currentUser = req.user.username; 
    var query = User.findOne({ 'username': reqbruker });
    
    if(reqbruker === currentUser){
        query.exec(function (err, funnetBruker) {
            
        if (err) {
             console.log(err);
        }else {
            console.log(funnetBruker);
          res.render("./brukere/settings", {brukeren: funnetBruker});
        }
  
});
    }else {
        req.flash("error", "Du har ikke tillatelse!");
        res.redirect("/");
    }
});
router.put("/:username/settings", middleware.isLoggedIn, function(req, res){
    var query = User.findOne({ 'username': req.params.username });
    User.findOneAndUpdate(query, req.body.brukeren, function(err, updatedBruker){
        if(err){
            console.log(err);
        } else {
            //finner bare første bruker i database ps oppdatater dette
            console.log("updated" + updatedBruker);
             console.log("updated: " + updatedBruker.username);
            res.redirect("/"+req.params.username);
        }
    })
 
});

module.exports = router; //exportert slik at den kan brukes i app.js
