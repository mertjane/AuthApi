const jwt = require("jsonwebtoken");

// Generate JWT Token
const genAuthToken = (user) => {
  const secretKey = process.env.JWT_SEC;

  const token = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    secretKey
  );

  return token;
};

module.exports = genAuthToken;
