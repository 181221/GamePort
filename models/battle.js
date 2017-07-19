
var mongoose = require("mongoose");

var battleSchema = new mongoose.Schema({
   _battleId: Number,
   spillere: [{
           type: mongoose.Schema.Types.ObjectId,
           ref: "Bruker"
   }],
   spill:
       {
           _spillId: {type: Number, ref: "Spill"}
       },
   poeng: [{
       playerOne: Number,
       playerTwo: Number
   }],
    
});

module.exports = mongoose.model("Battle", battleSchema);