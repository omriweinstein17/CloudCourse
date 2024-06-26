const { Router } = require("express");
const axios = require("axios").default;
const { v4: uuidv4 } = require("uuid");
const { Library, Ratings } = require("../library");
const router = Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
  "language",
  "summary",
];
const languages = ["heb", "eng", "spa", "chi"];

router.get("/", async (req, res) => {
  try {
    let fields = req.query;
    Object.entries(fields).forEach(([key, value]) => {
      if (!bookFields.includes(key) || key === "summary")
        throw new Error(`invalid Fields`);
      if (key === "language") {
        if (!languages.includes(value)) throw new Error(`invalid language`);
      }
    });
    const books = [];
    if (fields) {
      Library.forEach((book) => {
        let addToBooks = true;
        Object.entries(fields).forEach(([key, value]) => {
          if (key === "language") {
            if (!book.language.includes(value)) {
              addToBooks = false;
            }
          } else if (book[key] !== value) {
            addToBooks = false;
          }
        });
        if (addToBooks) books.push(book);
      });
      return res.status(200).json(books);
    } else {
      return res.status(200).json(Library);
    }
  } catch (err) {
    return res
      .status(404)
      .json({ error: err.message ? err.message : "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const index = Library.findIndex((book) => book.id === id);
  return index !== -1
    ? res.status(200).json(Library[index])
    : res.status(404).json({ error: "Book not found" });
});

router.post("/", async (req, res) => {
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
  let bookExist = false;
  Library.forEach((element) => {
    if (element.ISBN === body.ISBN) return (bookExist = true);
  });
  if (bookExist) return res.status(422).json({ error: "Book already exists" });
  const book = {
    title: body.title,
    ISBN: body.ISBN,
    genre: body.genre,
    id: uuidv4(),
    authors: "",
    language: [],
    publishedDate: "",
    publisher: "",
    summary: "",
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
  try {
    const openLibraryResponse = await axios.get(
      `https://openlibrary.org/search.json?q=${body.ISBN}&fields=key,title,author_name,language`
    );
    let languages = openLibraryResponse.data.docs[0].language;
    book.language = languages[0] ? languages : ["missing"];
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "unable to connect to Openlibrary" });
  }
  try {
    const apiKey = process.env.API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Summarize the book ${body.title} by ${authors} in 5 sentences
    or less.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    book.summary = summary;
    Library.push(book);
    const newRating = {
      id: book.id,
      title: book.title,
      values: [],
      average: 0.0,
    };
    Ratings.push(newRating);
    return res.status(201).json(book.id);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "unable to connect to GoogleGenerativeAI" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const index = Library.findIndex((book) => book.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  const book = req.body;
  // Check if the body contains all the required fields
  const hasAllFields = bookFields.every((field) => book.hasOwnProperty(field));
  if (!hasAllFields) {
    return res.status(422).json({ error: "Must contains all books fields" });
  }
  // Check if the data types of fields are correct (this is a simple check)
  const isValidBook =
    typeof book.title === "string" &&
    typeof book.authors === "string" &&
    typeof book.ISBN === "string" &&
    typeof book.publisher === "string" &&
    typeof book.publishedDate === "string" &&
    typeof book.genre === "string" &&
    genre.includes(book.genre) &&
    typeof book.id === "string" &&
    book.id === id &&
    Array.isArray(book.language) &&
    typeof book.summary === "string";
  if (!isValidBook) {
    return res.status(422).json({
      error: "Must contains all books fields with the correct types and values",
    });
  }
  const ratingIndex = Ratings.findIndex((rating) => rating.id === book.id);
  Library[index] = book;
  if (ratingIndex !== -1) {
    Ratings[ratingIndex].title = book.title;
  }
  return res.status(200).json(id);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const index = Library.findIndex((book) => book.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  else {
    Library.splice(index, 1);
    const ratingIndex = Ratings.findIndex((rating) => rating.id === id);
    Ratings.splice(ratingIndex, 1);
    return res.status(200).json(id);
  }
});

module.exports = router;
