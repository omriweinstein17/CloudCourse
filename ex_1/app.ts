import express, { Response, Request } from "express";
import morgan from "morgan";
import path from "path";

const app = express();
app.use(express.json());
app.use(morgan("tiny"));

app.use("/", require("./routes"));

export default app;
