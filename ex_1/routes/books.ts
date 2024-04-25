import { Router, Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Book, Fields, Rating } from "../interfaces";
const { Library, Ratings } = require("../library.ts");
const router = Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const querystring = require("querystring");
const genre: string[] = [
  "Fiction",
  "Children",
  "Biography",
  "Science",
  "Science Fiction",
  "Fantasy",
  "Other",
];
const bookFields: string[] = [
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

router.get("/", async (req: Request, res: Response) => {
  try {
    const queryString = querystring.stringify(req.query);
    let fields: Fields = {};
    if (queryString.includes("language%20contains%20")) {
      fields.language = queryString.split("%20")[2].slice(0, -1);
    } else {
      fields = req.query;
    }
    console.log(fields);
    Object.entries(fields).forEach(([key, value]) => {
      if (!bookFields.includes(key) || key === "summary")
        throw new Error(`invalid Fields`);
    });
    const books: Book[] = [];
    if (fields) {
      if (fields.language) {
        Library.forEach((book: Book) => {
          if (book.language.includes(fields.language!)) {
            books.push(book);
          }
        });
      } else {
        Library.forEach((book: Book) => {
          let addToBooks: boolean = true;
          Object.entries(fields).forEach(([key, value]) => {
            if (book[key] !== value) {
              addToBooks = false;
            }
          });
          if (addToBooks) books.push(book);
        });
      }
      return res.status(200).json(books);
    } else {
      return res.status(200).json(Library);
    }
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message ? err.message : "Internal Server Error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const index = Library.findIndex((book: Book) => book.id === id);
  return index !== -1
    ? res.status(200).json(Library[index])
    : res.status(404).json({ error: "Book not found" });
});

router.post("/", async (req: Request, res: Response) => {
  const body: any = req.body;
  let authors: string = "";
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
  let bookExist: boolean = false;
  Library.forEach((element: Book) => {
    if (element.ISBN === body.ISBN) return (bookExist = true);
  });
  if (bookExist) return res.status(422).json({ error: "Book already exists" });
  const book: Book = {
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
    volumeInfo.authors.forEach((element: string, i: number) => {
      if (i === 0) authors += element;
      else authors += " and " + element;
    });
    book.authors = authors ? authors : "missing";
    book.publishedDate = volumeInfo.publishedDate
      ? volumeInfo.publishedDate
      : "missing";
    book.publisher = volumeInfo.publisher ? volumeInfo.publisher : "missing";
  } catch (error: any) {
    return res.status(500).json({ error: "unable to connect to Google" });
  }
  try {
    const openLibraryResponse = await axios.get(
      `https://openlibrary.org/search.json?q=${body.ISBN}&fields=key,title,author_name,language`
    );
    let languages: string[] = openLibraryResponse.data.docs[0].language;
    book.language = languages[0] ? languages : ["missing"];
  } catch (error: any) {
    return res.status(500).json({ error: "unable to connect to Openlibrary" });
  }
  try {
    const apiKey: string = process.env.API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Summarize the book ${body.title} by ${authors} in 5 sentences
    or less.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    book.summary = summary;
    Library.push(book);
    const newRating: Rating = {
      id: book.id,
      title: book.title,
      values: [],
      average: 0.0,
    };
    Ratings.push(newRating);
    return res.status(201).json({ id: book.id });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "unable to connect to GoogleGenerativeAI" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
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
    Array.isArray(book.language) &&
    typeof book.summary === "string";
  if (!isValidBook)
    return res
      .status(422)
      .json({ error: "Must contains all books fields with the correct types" });
  const bookIndex = Library.findIndex((book: Book) => (book.id = id));
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  } else {
    Library[bookIndex] = book;
    return res.status(200).json({ id });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = Library.findIndex((book: Book) => book.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  else {
    Library.splice(index, 1);
    const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
    Ratings.splice(ratingIndex, 1);
    return res.status(200).json({ id: id });
  }
});

module.exports = router;
