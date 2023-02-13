const router = require("express").Router();
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const cloudinary = require("cloudinary").v2;

router.post("/", async (req, res) => {
  try {
    let newMessage;
    let imageUrl = [];

    if (req.files && req.files.image) {
      // check if image files are present
      if (Array.isArray(req.files.image)) {
        // if multiple image files are present, upload them to Cloudinary
        for (let i = 0; i < req.files.image.length; i++) {
          const result = await cloudinary.uploader.upload(
            req.files.image[i].tempFilePath,
            {
              use_filename: true,
              folder: "ichat-app",
            }
          );
          imageUrl.push(result.secure_url);
        }
        // create a new message object with conversationId, sender, and imageUrls
        newMessage = new Message({
          conversationId: req.body.conversationId,
          sender: req.body.sender,
          imageUrl: imageUrl,
          isSent: true,
        });
      } else {
        // if a single image file is present, upload it to Cloudinary
        const result = await cloudinary.uploader.upload(
          req.files.image.tempFilePath,
          {
            use_filename: true,
            folder: "ichat-app",
          }
        );
        // create a new message object with conversationId, sender, and imageUrl
        newMessage = new Message({
          conversationId: req.body.conversationId,
          sender: req.body.sender,
          imageUrl: result.secure_url,
          isSent: true,
        });
      }
    } else {
      // if no image files are present, create a new message object with conversationId, sender, and text
      newMessage = new Message({
        conversationId: req.body.conversationId,
        sender: req.body.sender,
        text: req.body.text,
        isSent: true,
      });
    }
    // save the message to the database
    const savedMessage = await newMessage.save();
    // update the conversation's notifications array with the new message
    await Conversation.updateOne(
      { _id: req.body.conversationId },
      { $push: { notifications: savedMessage } }
    );
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get a currentChat messages
router.get("/:conversationId", async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update sending message receivedCheck
router.put("/:conversationId", async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        isReceived: false,
      },
      {
        $set: { isReceived: true },
      }
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:conversationId/update-isRead", async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        isRead: false,
        sender: req.body.sender,
      },
      {
        $set: { isRead: true },
      }
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update blueTick when user online
router.put("/:conversationId", async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete selected message
router.delete("/:conversationId/:messageId", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete({
      conversationId: req.params.conversationId,
      _id: req.params.messageId,
    });
    if (!deletedMessage) {
      res.status(404).json({ message: "Message not found." });
    } else {
      res.status(200).json(deletedMessage);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// clear all messages
router.delete("/:conversationId", async (req, res) => {
  try {
    const deletedMessages = await Message.deleteMany({
      conversationId: req.params.conversationId,
    });
    if (!deletedMessages) {
      res.status(404).json({ message: "Messages not found." });
    } else {
      res.status(200).json({ message: "All messages deleted." });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
