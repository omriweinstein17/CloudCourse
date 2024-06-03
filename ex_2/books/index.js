const app = require("./app.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 80;

// Connection URL
const mongoURI = process.env.MONGO_URL; // Change this to your MongoDB URI

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
