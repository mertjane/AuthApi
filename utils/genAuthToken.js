const jwt = require("jsonwebtoken");

// Generate JWT Token
const genAuthToken = (user) => {
  const secretKey = process.env.JWT_SEC;

  const token = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      /* contacts: user.contacts,
      avatar: user.avatar,
      name: user.name,
      about: user.about, */
    },
    /* {
      userId: user._id,
      displayName: user.displayName,
      statusDisplay: user.about,
      avatar: user.profilePicture
    }, */
    secretKey
  );

  return token;
};

module.exports = genAuthToken;
