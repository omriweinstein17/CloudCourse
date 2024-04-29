const { Router } = require("express");
const { Ratings } = require("../library");

const router = Router();

router.get("/", async (req, res) => {
  const top = [];
  const sortedRatings = Ratings.sort((a, b) => {
    return b.average - a.average;
  });
  sortedRatings.forEach((rating, index) => {
    if (
      top.length >= 3 &&
      sortedRatings[index + 1] &&
      rating.average !== sortedRatings[index + 1].average
    )
      return;
    if (rating.values.length >= 3) {
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
