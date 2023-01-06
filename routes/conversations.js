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
      await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    const conversation = await Conversation.aggregate([
      { "$lookup": {
        "from": "messages",
        "let": { "conversationId": "$_id" },
        "pipeline": [
      { "$addFields": { "conversationId": { "$toObjectId": "$conversationId" }}},
      { "$match": { "$expr": { "$eq": [ "$conversationId", "$$conversationId"]}}},
      {"$sort": {  "_id": -1 }},
      {"$project": {"text": 1, "createdAt": 1, "_id": 0}},
      {"$limit": 1}
      ],"as": "lastMessages"}}
    ])
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
