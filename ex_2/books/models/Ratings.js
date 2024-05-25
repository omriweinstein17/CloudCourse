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
  values: {
    type: [Number],
    required: true,
  },
  average: {
    type: Number,
    required: true,
  },
});
RatingSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Rating = mongoose.model("rating", RatingSchema);
module.exports = Rating;
