import { Router, Request, Response } from "express";
const { Ratings, Library } = require("../library.ts");
import { Book, Rating } from "../interfaces";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) return res.status(200).json(Ratings);
  else {
    // const index = Library.findIndex((book: Book) => book.id === id);
    // if (index === -1) return res.status(404).json({ error: "Book not found" });
    const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
    if (ratingIndex === -1)
      return res.status(404).json({ error: "Book not found" });
    return res.status(200).json(Ratings[ratingIndex]);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // const index = Library.findIndex((book: Book) => book.id === id);
  // if (index === -1) return res.status(404).json({ error: "Book not found" });
  // else {
  const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
  if (ratingIndex === -1)
    return res.status(404).json({ error: "Book not found" });
  return res.status(200).json(Ratings[ratingIndex]);
  // }
});

router.post("/:id/values", async (req: Request, res: Response) => {
  const { id } = req.params;
  const val: number = req.body.value;
  if (!Number.isInteger(val) || val > 5 || val < 0)
    return res
      .status(422)
      .json({ error: "value must be an integer between 1 to 5" });
  // const index = Library.findIndex((book: Book) => book.id === id);
  // if (index === -1) return res.status(404).json({ error: "Book not found" });
  // else {
  const ratingIndex = Ratings.findIndex((rating: Rating) => rating.id === id);
  if (ratingIndex === -1)
    return res.status(404).json({ error: "Book not found" });
  Ratings[ratingIndex].average =
    (Ratings[ratingIndex].average * Ratings[ratingIndex].values.length + val) /
    (Ratings[ratingIndex].values.length + 1);
  Ratings[ratingIndex].values.push(val);
  return res.status(200).json(Ratings[ratingIndex]);
  // }
});

module.exports = router;
