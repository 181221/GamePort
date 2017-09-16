var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),   //auth
    methodOverride = require("method-override"),
    //database
    User        = require("./models/user"), 
    Spill       = require("./models/spill"),
    Battle      = require("./models/battle"),
    fs = require('fs'),
    battleRuter = require("./routes/battle"),
    indexRuter = require("./routes/index"),
    profilRuter = require("./routes/profil");
//require("./views/partials/header.js");
var url = process.env.DATABASEURL || "mongodb://localhost/gameportv16";
mongoose.connect(url , {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
mongoose.Promise = global.Promise;


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "valerian-steel",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ //tilgang til currentUser i alle templates
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error"); //tilgang til error
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRuter);
app.use("/battle", battleRuter);
app.use("/", profilRuter);
app.use(express.static(__dirname + "/views/games"));
app.get("/*", function(req, res){
    res.send("error404");
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Serveren er oppe å går!!");
});