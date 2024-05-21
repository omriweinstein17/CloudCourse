const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  authors: {
    type: String,
    required: true,
  },
  ISBN: {
    type: String,
    required: true,
    unique: true,
  },
  publishedDate: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
});

const Rating = mongoose.model("rating", RatingSchema);
