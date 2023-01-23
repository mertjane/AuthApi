const router = require("express").Router();
const Message = require("../models/message");

// sent a message
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a currentChat messages
router.get("/:conversationId", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const offset = (page - 1) * limit;

  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({"_id": -1}).skip(offset).limit(limit)
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete selected message

router.delete("/:conversationId/:messageId", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete({
      conversationId: req.params.conversationId,
      _id: req.params.messageId
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


module.exports = router;
