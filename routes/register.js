const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");
const User = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

const router = express.Router();

// Validation for Register
router.post("/", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(30).required(),
    email: Joi.string().min(6).max(200).required().email(),
    password: Joi.string().min(6).max(200).required(),
  });

  const { error } = schema.validate(req.body);

  // Check if the user already exist or not
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({username: req.body.username});
  if (user) return res.status(400).send("Username already taken");

  let isValid = await User.findOne({email: req.body.email});
  if(isValid) return res.status(400).send("Email already taken")
  
  // DOC the userData
  const { username, email, password } = req.body;

  user = new User({ username, email, password });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  // Get token
  const token = genAuthToken(user);

  res.send(token);
});

module.exports = router;
