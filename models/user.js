var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
   username: String,
   password: String,
   forNavn: String,
   etterNavn: String,
   email: String,
   avatar: String,
   utfordringer: [{
      id: {type: mongoose.Schema.Types.ObjectId, ref: "Battle"},
      ferdig: {type: Boolean, default: false}
   }],
   totalscore: {type: Number, default: 0},
   isAdmin: {
      type: Boolean,
      default: false
   }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
