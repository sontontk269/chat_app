const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/AuthRoutes");
const contactsRoutes = require("./routes/ContactRoutes");
const setupSocket = require("./socket");
const messagesRoutes = require("./routes/MessagesRoutes");
const channelRoutes = require("./routes/ChannelRoutes");

const port = process.env.PORT || 5123;
const DB_URL = process.env.DB_URL;

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Connect DB sucessfull");
  })
  .catch((err) => console.log(err.message));

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
// socket.io
setupSocket(server);
