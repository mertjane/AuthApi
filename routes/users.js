const User = require("../models/user");
const router = require("express").Router();
// const genAuthToken = require("../utils/genAuthToken");
// const bcrypt = require("bcrypt");

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
      const { _id, name, about, avatar } = contact;
      contactList.push({ _id, name, about, avatar });
    });
    res.status(200).json(contactList);
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
});

// SEARCH USER
router.get('/search/:key', async (req, res) => {
  try{
    const user = await User.find(
      {
        "$or": [
          {username:{$regex:req.params.key}}
        ]
      }
    )
    res.send(user)
  } catch(err){
    return res.status(500).json("No user found")
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

// ADD A CONTACT
router.put("/:id/add", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.contacts.includes(req.body.userId)) {
        await user.updateOne({ $push: { contacts: req.body.userId } });
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
      const currentUser = await User.findById(req.body.userId);
      if (user.contacts.includes(req.body.userId)) {
        await user.updateOne({ $pull: { contacts: req.body.userId } });
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
