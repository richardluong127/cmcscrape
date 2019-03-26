var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CoinSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Coin = mongoose.model("Coin", CoinSchema);

module.exports = Coin;
