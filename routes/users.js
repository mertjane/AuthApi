const User = require("../models/user");
const router = require("express").Router();
// const genAuthToken = require("../utils/genAuthToken");
// const bcrypt = require("bcrypt");

// get friend
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const name = req.query.name;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ name: name });
    const {
      password,
      updatedAt,
      createdAt,
      isAdmin,
      username,
      email,
      contacts,
      __v,
      ...other
    } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET A USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const {
      _id,
      password,
      updatedAt,
      createdAt,
      username,
      email,
      contacts,
      isAdmin,
      blockedContacts,
      __v,
      ...other
    } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER CONTACT LIST
router.get("/contacts/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const contacts = await Promise.all(
      user.contacts.map((contactId) => {
        return User.findById(contactId);
      })
    );
    let contactList = [];
    contacts.map((contact) => {
      const { _id, name, about, avatar, privacy} = contact;
      contactList.push({ _id, name, about, avatar, privacy});
    });
    res.status(200).json(contactList);
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
});

// BLOCK CONTACT
router.put("/:id/block", async (req, res) => {
  try {
    const userA = await User.findById(req.params.id);
    const userB = await User.findById(req.body.friendId);

    if (!userA.blockedContacts.includes(req.body.friendId)) {
      await userA.updateOne({ $push: { blockedContacts: req.body.friendId } });
    }

    if (!userB.blockedContacts.includes(req.params.id)) {
      await userB.updateOne({ $push: { blockedContacts: req.params.id } });
    }

    res.status(200).json({ message: "User has been blocked" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UNBLOCK CONTACT
router.put("/:id/unblock", async (req, res) => {
  try {
    const userA = await User.findById(req.params.id);
    const userB = await User.findById(req.body.friendId);

    if (userA.blockedContacts.includes(req.body.friendId)) {
      await userA.updateOne({ $pull: { blockedContacts: req.body.friendId } });
    }

    if (userB.blockedContacts.includes(req.params.id)) {
      await userB.updateOne({ $pull: { blockedContacts: req.params.id } });
    }

    res.status(200).json({ message: "User has been unblocked" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET BLOCKED CONTACT LIST
router.get("/blockedContacts/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const blockedContacts = await Promise.all(
      user.blockedContacts.map((contactId) => {
        return User.findById(contactId);
      })
    );
    let blockedContactList = [];
    blockedContacts.map((contact) => {
      const { _id, name, about, avatar } = contact;
      blockedContactList.push({ _id, name, about, avatar });
    });
    res.status(200).json(blockedContactList);
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
});

// SEARCH USER
router.get("/search/:key", async (req, res) => { 
  try {
    const user = await User.find({
      $or: [
        { username: { $regex: req.params.key, $options: "i" } },
      ]
    });
    if (!user) return res.status(404).json({ message: "No user found" });
    res.send(user);
  } catch (err) {
    return res.status(500).json({ message: "Error occurred while searching for user", error: err });
  }
});


// UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.send(req.body);
  } catch (err) {
    return res.status(500).json("Something went wrong");
  }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You are not allowed!");
  }
});

// UPDATE THEME
router.put("/:id/theme", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { theme: req.body.theme },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res
        .status(200)
        .json({ message: "Theme changed successfully", theme: user.theme });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE CHAT WALLPAPER
router.put("/:id/update-chat-wallpaper", (req, res) => {
  const { color } = req.body;
  const { id } = req.params;

  User.findByIdAndUpdate(
    id,
    { chatWallpaper: color },
    { new: true },
    (err, user) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(user);
    }
  );
});

// UPDATE CHAT BACKGROUND DRAWINGS
router.put("/:id/update-chat-drawing", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { drawings: req.body.drawings },
    { new: true },
    (err, user) => {
      if (err) return res.status(500).send(err);
      return res.send(user);
    }
  );
});

// UPDATE USER SOUNDS 
router.put("/:id/update-sounds", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { sounds: req.body.sounds },
    { new: true },
    (err, user) => {
      if (err) return res.status(500).send(err);
      return res.send(user);
    }
  );
});


//UPDATE PRIVACY SETTINGS
router.put("/:id/update-privacy", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "privacy.lastSeen": req.body.lastSeen,
          "privacy.onlineStatus": req.body.onlineStatus,
          "privacy.profilePhoto": req.body.profilePhoto,
          "privacy.aboutMe": req.body.aboutMe,
          "privacy.readReceipt": req.body.readReceipt,
        }
      },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({
        message: "User privacy successfully updated",
        privacy: user.privacy
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD A CONTACT
router.put("/:id/add", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.friendId);
      if (!user.contacts.includes(req.body.friendId)) {
        await user.updateOne({ $push: { contacts: req.body.friendId } });
        await currentUser.updateOne({ $push: { contacts: req.params.id } });
        res.status(200).json("User has been added");
      } else {
        res.status(403).json("You already add this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot add yourself");
  }
});

// REMOVE A CONTACT
router.put("/:id/remove", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.friendId);
      if (user.contacts.includes(req.body.friendId)) {
        await user.updateOne({ $pull: { contacts: req.body.friendId } });
        await currentUser.updateOne({ $pull: { contacts: req.params.id } });
        res.status(200).json("User has been removed");
      } else {
        res.status(403).json("You already remove this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot remove yourself");
  }
});

module.exports = router;
