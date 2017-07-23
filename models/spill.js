var mongoose = require("mongoose");

var spillSchema = new mongoose.Schema({
    name: String,
    beskrivelse: String,
    tidspunkt: Date
});

module.exports = mongoose.model("Game", spillSchema);