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
    
    if(reqbruker === currentUser){
        User.find(reqbruker, function(err, funnetBruker){
            if(err){
                req.flash("error", err.message);
                res.redirect("/");
            } else {
                res.render("./brukere/settings", {brukeren: funnetBruker});
            }
        });
    }else {
        req.flash("error", "Du har ikke tillatelse!");
        res.redirect("/");
    }
});
router.put("/:username/settings", middleware.isLoggedIn, function(req, res){
    User.findOneAndUpdate(req.params.username, req.body.brukeren, function(err, updatedBruker){
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    })
 
});

module.exports = router; //exportert slik at den kan brukes i app.js
