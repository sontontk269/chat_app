const { default: mongoose } = require("mongoose");
const Channel = require("../models/ChannelModel");
const User = require("../models/UserModel");

const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(400).send("Admin user not found");
    }

    const validMember = await User.find({ _id: { $in: members } });

    if (validMember.length !== members.length) {
      return res.status(400).send("Some members are not valid users.");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Error");
  }
};

const getUserChannel = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    res.status(200).json({ channels });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Error");
  }
};

const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });
    if (!channel) res.status(404).send("Channel not found");
    
    const channels = channel.messages
    res.status(200).json({ channels });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Error");
  }
};

module.exports = { createChannel, getUserChannel, getChannelMessages };
