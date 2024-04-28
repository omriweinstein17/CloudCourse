const { Router } = require("express");
const { Ratings } = require("../library");

const router = Router();

router.get("/", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(200).json(Ratings);
  else {
    const ratingIndex = Ratings.findIndex((rating) => rating.id === id);
    if (ratingIndex === -1)
      return res.status(404).json({ error: "Book not found" });
    return res.status(200).json(Ratings[ratingIndex]);
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const ratingIndex = Ratings.findIndex((rating) => rating.id === id);
  if (ratingIndex === -1)
    return res.status(404).json({ error: "Book not found" });
  return res.status(200).json(Ratings[ratingIndex]);
});

router.post("/:id/values", async (req, res) => {
  const { id } = req.params;
  const val = req.body.value;
  if (!Number.isInteger(val) || val > 5 || val <= 0)
    return res
      .status(422)
      .json({ error: "value must be an integer between 1 to 5" });
  const ratingIndex = Ratings.findIndex((rating) => rating.id === id);
  if (ratingIndex === -1)
    return res.status(404).json({ error: "Book not found" });
  Ratings[ratingIndex].average = (
    (Ratings[ratingIndex].average * Ratings[ratingIndex].values.length + val) /
    (Ratings[ratingIndex].values.length + 1)
  ).toFixed(2);
  Ratings[ratingIndex].values.push(val);
  return res.status(200).json(Ratings[ratingIndex].average);
});

module.exports = router;
