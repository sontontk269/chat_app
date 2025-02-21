const { Server } = require('socket.io')
const Message = require('./models/MessagesModel')
const Channel = require('./models/ChannelModel')
const Conversation = require('./models/ConversationModel')

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }
  })
  const userSocketMap = new Map()

  const disconnect = (socket) => {
    console.log(`Client Disconnectd: ${socket.id}`)
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId)
        break
      }
    }
  }

  //seenMessage

  const seenMessage = async (conversationId, recipient) => {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return
    if (!conversation.members.includes(recipient)) return
    await Message.updateMany(
      { conversationId, isSeen: false, sender: { $ne: recipient } },
      { $addToSet: { seenBy: recipient }, $set: { isSeen: true } }
    )
    io.emit('messageSeen', { conversationId, recipient })
  }

  //send Message

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender)
    const recipientSoketId = userSocketMap.get(message.recipient)

    const createdMessage = await Message.create(message)

    const messageData = await Message.findById(createdMessage._id)
      .populate('sender', 'id email firstName lastName image color')
      .populate('recipient', 'id email firstName lastName image color')

    await Conversation.findOneAndUpdate(
      { members: { $all: [message.sender, message.recipient] } },
      { lastMessage: createdMessage._id, timestamp: new Date() },
      { new: true, upsert: true }
    )

    if (recipientSoketId) {
      io.to(recipientSoketId).emit('recieveMessage', messageData)
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit('recieveMessage', messageData)
    }
  }

  const senChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl
    })

    const messageData = await Message.findById(createdMessage._id).populate('sender', 'id email firstName lastName image color').exec()

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id }
    })

    const channel = await Channel.findById(channelId).populate('members')
    const finalData = { ...messageData._doc, channelId: channel._id }
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString())
        if (memberSocketId) {
          io.to(memberSocketId).emit('recieve-channel-message', finalData)
        }
      })
      const adminSocketId = userSocketMap.get(channel.admin._id.toString())
      if (adminSocketId) {
        io.to(adminSocketId).emit('recieve-channel-message', finalData)
      }
    }
  }

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    if (!userId) return console.log('User ID is not provided during connection.')
    userSocketMap.set(userId, socket.id)
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`)

    socket.on('sendMessage', sendMessage)
    socket.on('seenMessage', seenMessage)
    socket.on('send-channel-message', senChannelMessage)
    socket.on('disconnect', () => disconnect(socket))
  })
}
module.exports = setupSocket
