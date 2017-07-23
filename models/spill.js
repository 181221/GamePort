var mongoose = require("mongoose");

var spillSchema = new mongoose.Schema({
    _gameId: {type: mongoose.Schema.Types.ObjectId, ref: "Battle"},
    name: String,
    beskrivelse: String,
    tidspunkt: Date
});

module.exports = mongoose.model("Game", spillSchema);