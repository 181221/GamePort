var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
   username: String,
   password: String,
   forNavn: String,
   etterNavn: String,
   email: String,
   avatar: {type: String, default: "http://www.msecmarketing.com/wp-content/uploads/2017/01/default.gif"},
   utfordringer: [{
      id: {type: mongoose.Schema.Types.ObjectId, ref: "Battle"},
      ferdig: {type: Boolean, default: false}
   }],
   totalscore: {type: Number, default: 0},
   isAdmin: {
      type: Boolean,
      default: false
   },
   beskrivelse: {type: String, default: null},
   opprettet: Date,
   membertype: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
