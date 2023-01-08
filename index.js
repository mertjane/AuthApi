const express = require("express");
const mongoose = require("mongoose");
const register = require("./routes/register");
const login = require("./routes/login");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const userRoute = require("./routes/users");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const app = express();
const socket = require("socket.io");

dotenv.config();

// DB connection
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => {
    console.log("DB connection failed", err.message);
  });

app.use("/images", express.static(path.join(__dirname, "public/images")));

// middlewares
app.use(express.json());
app.use(fileUpload());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

// auth
app.use("/api/register", register);
app.use("/api/login", login);

app.get("/", (req, res) => {
  res.send("ichat API");
});

// users
app.use("/api/user", userRoute);

// Upload Image
app.post("/api/user/:id", async (req, res) => {
  const filename = req.files.avatar.name;
  const file = req.files.avatar;
  let uploadPath = __dirname + "/public/images/" + filename;
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.send(err);
    }
    res.status(200).json("Avatar successfully updated");
  });
});

// conversations&messages
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

const port = process.env.PORT || 5000;

// app.listen(port, console.log(`Server is running`));

const server = app.listen(port, console.log("Server is running"));

// socket
const io = socket(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId, roomId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId, roomId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //connection
  console.log("a user connected to socket");

  socket.on("join-chat", (roomId) => {
    socket.join(roomId);
    console.log("User joined room " + roomId);
  });

  // user online status
  socket.on("user-online", () => {
    socket.broadcast.emit("user-online-from-server");
  });

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //typing
  socket.on("start-typing", ({ roomId }) => {
    let skt = socket.broadcast;
    skt = roomId ? skt.to(roomId) : skt;
    skt.emit("start-typing-from-server");
  });
  socket.on("stop-typing", () => {
    socket.broadcast.emit("stop-typing-from-server");
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.broadcast.emit("user-disconnect-from-server");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
