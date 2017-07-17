var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var fs = require('fs');


router.get("/", function(req, res){
    res.render("landing");
});

router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        failureFlash: "Username or password is incorrect.",
        successFlash: "Welcome back!",
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
        
});

router.get("/ranking", function(req, res) {
    User.find({}, function(err, users) {
        if(err){
            req.flash("error", err);
            req.redirect("back");
        } else {
            res.render("ranking", {users: users});
        }
    });
   
});

router.get("/secret", isLoggedIn, function(req, res) {
   res.send("du nådde den hemmelige siden!"); 
});

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req,res){
   var newUser = new User({username: req.body.username});
    
   User.register(newUser, req.body.password, function(err, user){
       if(err){
           req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "Velkommen til gameport!!");
           res.redirect("/");
       });
   });
});
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!"); //alltid før redirect!
   res.redirect("/");
});

router.get("/games", function(req, res) {
  res.render("games")
  //./games/spaceinvaders/index.html
});





function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that!");//legger til flash. coden skal utføres før du redirecter!
    res.redirect("/login");
};

module.exports = router; //exportert slik at den kan brukes i app.js
