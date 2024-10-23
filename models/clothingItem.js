const mongoose = require("mongoose");

const clothingItemSchema = new mongoose.Schema({});

module.export = mongoose.model("item", clothingItemSchema);
