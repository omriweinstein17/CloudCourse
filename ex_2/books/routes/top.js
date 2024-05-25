const { Router } = require("express");
const Rating = require("../models/Ratings");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const Ratings = await Rating.find();
    // Filter ratings with at least 3 values and sort by average descending
    const eligibleRatings = Ratings.filter(
      (rating) => rating.values.length >= 3
    );
    const sortedRatings = eligibleRatings.sort((a, b) => b.average - a.average);

    const top = [];

    sortedRatings.forEach((rating, index) => {
      if (top.length < 3) {
        // If fewer than 3 items, add directly
        top.push({
          title: rating.title,
          id: rating.id,
          average: rating.average,
        });
      } else if (
        top.length === 3 &&
        rating.average === top[top.length - 1].average
      ) {
        // If exactly 3 items and current item ties with the third, add it
        top.push({
          title: rating.title,
          id: rating.id,
          average: rating.average,
        });
      }
      // Stop processing if the current rating is less than the last item in top and top has 3 or more items
      if (top.length >= 3 && rating.average < top[top.length - 1].average) {
        return;
      }
    });

    return res.status(200).json(top);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

module.exports = router;
