var User = require("../models/user");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Du må være innlogget for å gjøre dette!");//legger til flash. coden skal utføres før du redirecter!
    res.redirect("/login");
}
middlewareObj.riktigBruker = function(req, res, next){
    
}


module.exports = middlewareObj;