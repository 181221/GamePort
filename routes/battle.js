var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Battle = require("../models/battle");
var Spill = require("../models/spill");
var middle = require("../middleware/index");

router.get("/", function(req, res) {
   res.send("dette er battle sin landing page!"); 
});

router.get("/new",middle.isLoggedIn, function(req,res){
    res.render("Battles/new");
});


module.exports = router; //exportert slik at den kan brukes i app.js