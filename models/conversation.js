const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
        type: Array,
    },
    /* lastMessage: {type: String, default: ""},
    time: {type: String, default: ""} */
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
