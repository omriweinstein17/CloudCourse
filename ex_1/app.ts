import { error } from "console";
import express, { Response, Request } from "express";
import morgan from "morgan";
import path from "path";

const app = express();
app.use((req: Request, res: Response, next) => {
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

export default app;
