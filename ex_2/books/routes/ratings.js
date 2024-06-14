const { Router } = require("express");
const Rating = require("../models/Ratings");
// const { Ratings } = require("../library");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      const ratings = await Rating.find();
      return res.status(200).json(ratings);
    } else {
      const rating = await Rating.findOne({ id });
      return rating
        ? res.status(200).json([rating])
        : res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findOne({ id });
    return rating
      ? res.status(200).json(rating)
      : res.status(404).json({ error: "Book not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

router.post("/:id/values", async (req, res) => {
  try {
    const { id } = req.params;
    const val = req.body.value;
    if (!Number.isInteger(val) || val > 5 || val <= 0)
      return res
        .status(422)
        .json({ error: "value must be an integer between 1 to 5" });
    const rating = await Rating.findOne({ id });
    if (!rating) return res.status(404).json({ error: "Book not found" });
    rating.average = (
      (rating.average * rating.values.length + val) /
      (rating.values.length + 1)
    ).toFixed(2);
    rating.values.push(val);
    const result = await Rating.findOneAndUpdate({ id: rating.id }, rating, {
      runValidators: true,
    });
    if (result.nModified === 0) {
      return res.status(404).send("Rating not found or no changes made");
    }
    return res.status(200).json(rating.average);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

module.exports = router;
