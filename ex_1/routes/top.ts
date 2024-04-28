import { Router, Request, Response } from "express";
import { Book, Rating } from "../interfaces";
const { Ratings, Library } = require("../library.ts");

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const top: Rating[] = [];
  const sortedRatings: Rating[] = Ratings.sort((a: Rating, b: Rating) => {
    return b.average - a.average;
  });
  sortedRatings.forEach((rating: Rating, index: number) => {
    if (top.length >= 3 && rating.average !== sortedRatings[index + 1].average)
      return;
    if (rating.values!.length >= 3) {
      top.push({
        title: rating.title,
        id: rating.id,
        average: rating.average,
      });
    }
  });
  return res.status(200).json(top);
});

module.exports = router;
