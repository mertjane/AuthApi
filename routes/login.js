const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");
const User = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

const router = express.Router();

router.post("/", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  // Check if the user already exist or not
  let user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send("Invalid username or password...");

  // Check if the user pwd true or not
  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send("Invalid password...");

  // Generate Token
  const token = genAuthToken(user);

  res.send(token);
});

module.exports = router;
