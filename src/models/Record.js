const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  verified: { type: String, enum: ["Yes", "No"], required: true },
});

module.exports = mongoose.model("Record", recordSchema);
