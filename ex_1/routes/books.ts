import { Router, Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { title } from "process";
import { Book } from "../library";
const Library = require("../library.ts");
const router = Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genre: string[] = [
  "Fiction",
  "Children",
  "Biography",
  "Science",
  "Science Fiction",
  "Fantasy",
  "Other",
];

router.get("/", async (req: Request, res: Response) => {
  res.send(Library);
});

router.get("/:id", async (req: Request, res: Response) => {});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body: any = req.body;
    if (
      !body.ISBN ||
      !body.title ||
      !body.genre ||
      !genre.includes(body.genre)
    ) {
      return res.status(422).json({ error: "Body is not correct" });
    }
    let bookExist: boolean = false;
    Library.forEach((element: Book) => {
      if (element.ISBN === body.ISBN) bookExist = true;
    });
    if (bookExist)
      return res.status(422).json({ error: "Book already exists" });
    const googleResponse = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${body.ISBN}&fields=items(volumeInfo(authors,publisher,publishedDate,language))`
    );
    const volumeInfo = googleResponse.data.items[0].volumeInfo;
    let authors: string = "";
    volumeInfo.authors.forEach((element: string, i: number) => {
      if (i === 0) authors += element;
      else authors += " and " + element;
    });
    const openLibraryResponse = await axios.get(
      `https://openlibrary.org/search.json?q=${body.ISBN}&fields=key,title,author_name,language`
    );
    const apiKey: string = process.env.API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Summarize the book ${body.title} by ${authors} in 5 sentences
    or less.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    const book: Book = {
      title: body.title,
      authors: authors,
      ISBN: body.ISBN,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate
        ? volumeInfo.publishedDate
        : "missing",
      genre: body.genre,
      language: openLibraryResponse.data.docs[0].language,
      summary: summary,
      id: uuidv4(),
    };
    Library.push(book);
    res.status(201).send(book.id);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Unprocessable Content" });
  }
  // Define an asynchronous function to fetch data
});

module.exports = router;
