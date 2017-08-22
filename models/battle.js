
var mongoose = require("mongoose");

var battleSchema = new mongoose.Schema({
   utfordrer: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
      username: String,
      score: Number,
      ferdig: Boolean
   },
   motstander: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
      username: String,
      score: Number,
      ferdig: Boolean
   },
   spill:
       {
           id: {type: mongoose.Schema.Types.ObjectId, ref: "Game"},
           navn: {type: String, default:"SpaceInvaders"},
           beskrivelse: String
       },
   tidspunkt: Date
});

module.exports = mongoose.model("Battle", battleSchema);