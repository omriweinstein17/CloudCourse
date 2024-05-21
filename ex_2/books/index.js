const app = require("./app.js");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 8000;

// Connection URL
const mongoURI = "mongodb://localhost:27017/mydatabase"; // Change this to your MongoDB URI

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
