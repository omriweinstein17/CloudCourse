const express = require("express");
const morgan = require("morgan");

const app = express();
app.use((req, res, next) => {
  // Check if the Content-Type header is application/json
  if (
    (req.method === "POST" || req.method === "PUT") &&
    !req.is("application/json")
  ) {
    return res.status(415).json({ error: "Unsupported media type" });
  }
  next(); // Move to the next middleware or route handler
});
app.use(express.json());
app.use(morgan("tiny"));

app.use("/", require("./routes"));

// Middleware for handling 404 errors
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

module.exports = app;
