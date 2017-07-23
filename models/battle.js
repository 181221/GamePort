
var mongoose = require("mongoose");

var battleSchema = new mongoose.Schema({
   spillere: [{
      id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
      username: String,
      score: Number
   }],
   spill:
       {
           id: {type: mongoose.Schema.Types.ObjectId, ref: "Game"},
           name: String
       },
});

module.exports = mongoose.model("Battle", battleSchema);