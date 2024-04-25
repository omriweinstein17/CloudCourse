import { Router, Request, Response } from "express";
const { Ratings, Library } = require("../library.ts");
import { Book, Rating } from "../interfaces";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) return res.status(200).json(Ratings);
  else {
    const index = Library.findIndex((book: Book) => book.id === id);
    if (index === -1) return res.status(404).json({ error: "Book not found" });
    const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
    return res.status(200).json(Ratings[ratingIndex]);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = Library.findIndex((book: Book) => book.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  else {
    const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
    return res.status(200).json(Ratings[ratingIndex]);
  }
});

router.post("/:id/values", async (req: Request, res: Response) => {
  const { id } = req.params;
  const val = req.body.value;
  const index = Library.findIndex((book: Book) => book.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });
  else {
    const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
    Ratings[ratingIndex].values.push(val);
    Ratings[ratingIndex].average =
      (Ratings[ratingIndex].average + val) / Ratings[ratingIndex].values.length;
    return res.status(200).json(Ratings[ratingIndex]);
  }
});

module.exports = router;
