const { Router } = require("express");
const axios = require("axios").default;
const { v4: uuidv4 } = require("uuid");
// const { Library, Ratings } = require("../library");
const router = Router();
const Book = require("../models/Books");
const Rating = require("../models/Ratings");

const genre = [
  "Fiction",
  "Children",
  "Biography",
  "Science",
  "Science Fiction",
  "Fantasy",
  "Other",
];
const bookFields = [
  "title",
  "authors",
  "ISBN",
  "publisher",
  "publishedDate",
  "genre",
  "id",
];

router.get("/", async (req, res) => {
  try {
    let fields = req.query;
    console.log(fields);
    Object.entries(fields).forEach(([key, value]) => {
      if (!bookFields.includes(key)) throw new Error(`invalid Fields`);
    });
    const books = [];
    if (fields) {
      const library = await Book.find();
      library.forEach((book) => {
        let addToBooks = true;
        Object.entries(fields).forEach(([key, value]) => {
          if (book[key] !== value) {
            addToBooks = false;
          }
        });
        if (addToBooks) books.push(book);
      });
      return res.status(200).json(books);
    } else {
      return res.status(200).json(library);
    }
  } catch (err) {
    return res
      .status(404)
      .json({ error: err.message ? err.message : "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const book = await Book.findOne({ id });
  return book
    ? res.status(200).json(book)
    : res.status(404).json({ error: "Book not found" });
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    let authors = "";
    if (!body.ISBN || !body.title || !body.genre) {
      return res.status(422).json({
        error: "Missing book field, body must include ISBN, title and genre",
      });
    }
    if (!genre.includes(body.genre)) {
      return res.status(422).json({
        error: "Invalid Genre",
      });
    }
    const Library = await Book.find();
    let bookExist = false;
    Library.forEach((element) => {
      if (element.ISBN === body.ISBN) return (bookExist = true);
    });
    if (bookExist)
      return res.status(422).json({ error: "Book already exists" });
    const book = {
      title: body.title,
      ISBN: body.ISBN,
      genre: body.genre,
      id: uuidv4(),
      authors: "",
      publishedDate: "",
      publisher: "",
    };
    try {
      const googleResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${body.ISBN}&fields=items(volumeInfo(authors,publisher,publishedDate))`
      );
      const volumeInfo = googleResponse.data.items[0].volumeInfo;
      if (volumeInfo.authors) {
        volumeInfo.authors.forEach((element, i) => {
          if (i === 0) authors += element;
          else authors += " and " + element;
        });
      }
      book.authors = authors ? authors : "missing";
      book.publishedDate = volumeInfo.publishedDate
        ? volumeInfo.publishedDate
        : "missing";
      book.publisher = volumeInfo.publisher ? volumeInfo.publisher : "missing";
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "unable to connect to Google" });
    }
    const newBook = new Book(book);
    await newBook.save();
    const rating = {
      id: book.id,
      title: book.title,
      values: [],
      average: 0.0,
    };
    const newRating = new Rating(rating);
    await newRating.save();
    return res.status(201).json(book.id);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const newBookDetails = req.body;
    // Check if the body contains all the required fields
    const hasAllFields = bookFields.every((field) =>
      newBookDetails.hasOwnProperty(field)
    );
    if (!hasAllFields) {
      return res.status(422).json({ error: "Must contains all books fields" });
    }
    // Check if the data types of fields are correct (this is a simple check)
    const isValidBook =
      typeof newBookDetails.title === "string" &&
      typeof newBookDetails.authors === "string" &&
      typeof newBookDetails.ISBN === "string" &&
      typeof newBookDetails.publisher === "string" &&
      typeof newBookDetails.publishedDate === "string" &&
      typeof newBookDetails.genre === "string" &&
      genre.includes(newBookDetails.genre) &&
      typeof newBookDetails.id === "string" &&
      newBookDetails.id === id;
    if (!isValidBook)
      return res.status(422).json({
        error: "Must contains all books fields with the correct types",
      });
    const book = await Book.findOneAndUpdate({ id }, newBookDetails, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ error: "Book not found" });
    const rating = await Rating.findOneAndUpdate(
      { id },
      { title: newBookDetails.title },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!book) return res.status(404).json({ error: "Book not found" });
    return res.status(200).json(id);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOneAndDelete({ id });
    if (!book) {
      return res.status(404).json("Book not found");
    }
    const rating = await Rating.findOneAndDelete({ id });
    if (!rating) {
      return res.status(404).json("Rating not found");
    }
    return res.status(200).json(id);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

module.exports = router;
