
var mongoose = require("mongoose");

var battleSchema = new mongoose.Schema({
   spillere: [{
      id: {type: mongoose.Schema.Types.ObjectId, ref: "Bruker"},
      username: String,
      score: Number
   }],
   spill:
       {
           id: {type: mongoose.Schema.Types.ObjectId, ref: "Spill"},
           name: String
       },
});

module.exports = mongoose.model("Battle", battleSchema);