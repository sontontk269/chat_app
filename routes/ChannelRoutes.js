const { Router } = require("express");
const verifyToken = require("../middlewares/AuthMiddleware");
const {
  createChannel,
  getUserChannel,
  getChannelMessages,
} = require("../controllers/ChannelsController");

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannel);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);


module.exports = channelRoutes;
