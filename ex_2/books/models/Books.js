const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookSchema = new Schema({
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

BookSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Book = mongoose.model("book", BookSchema);
module.exports = Book;
