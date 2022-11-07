const express = require("express");
const mongoose = require("mongoose");
const register = require("./routes/register");
const login = require("./routes/login");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();

dotenv.config();

// DB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => {
    console.log("DB connection failed", err.message);
  });

app.use(express.json());
app.use(cors());

// auth
app.use("/api/register", register);
app.use("/api/login", login);

app.get("/", (req, res) => {
  res.send("ichat API");
});

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server is running`));
