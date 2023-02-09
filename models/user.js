const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    avatar: {type: String, default: ""},
    name: { type: String, default: "", max: 13 },
    about: { type: String, default: "Hey! I am using ichat", max: 30 },
    contacts: { type: Array, default: [] },
    blockedContacts: { type: Array, default: [] },
    theme: { type: String, default: "default", enum:["default", "dark", "open"]},
    chatWallpaper: { type: String, default: "#ede8e0" },
    drawings: { type: Boolean, default: true },
    sounds: { type: Boolean, default: true },
    privacy: {
      lastSeen: { type: String, default: "everyone", enum: ["everyone", "contacts", "none"] },
      onlineStatus: { type: String, default: "everyone", enum: ["everyone", "contacts", "none"] },
      profilePhoto: { type: String, default: "everyone", enum: ["everyone", "contacts", "none"] },
      aboutMe: { type: String, default: "everyone", enum: ["everyone", "contacts", "none"] },
      readReceipt: { type: Boolean, default: true },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
