var mongoose = require("mongoose");

var spillSchema = new mongoose.Schema({
    _gameId: {type: Number, ref: "Battle"},
    beskrivelse: String,
    tidspunkt: Date
});

module.exports = mongoose.model("Game", spillSchema);