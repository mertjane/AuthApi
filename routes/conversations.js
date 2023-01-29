const router = require("express").Router();
const Conversation = require("../models/conversation");

// new conversation
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conversation of user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.aggregate([
      { $match: { members: { $in: [req.params.userId] } } },
      {
        $lookup: {
          from: "messages",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $addFields: {
                conversationId: { $toObjectId: "$conversationId" },
              },
            },
            {
              $match: {
                $expr: { $eq: ["$conversationId", "$$conversationId"] },
              },
            },
            { $sort: { _id: -1 } },
            { $project: { imageUrl: 1, text: 1, createdAt: 1, _id: 0 } },
            { $limit: 1 },
          ],
          as: "lastMessages",
        },
      },
    ]);
    res.status(200).json(
      conversation?.sort((c1, c2) => {
        return (
          new Date(c2.lastMessages[0]?.createdAt) -
          new Date(c1?.lastMessages[0]?.createdAt)
        );
      })
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// delete conversation
router.delete("/:conversationId", async (req, res) => {
  try {
    const deletedConversation = await Conversation.findByIdAndDelete(
      req.params.conversationId
    );
    if (!deletedConversation) {
      res.status(404).json({ message: "Conversation not found." });
    } else {
      res.status(200).json(deletedConversation);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
