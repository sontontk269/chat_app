const Conversation = require('../models/ConversationModel')
const Message = require('../models/MessagesModel')
const { mkdirSync, renameSync } = require('fs')

const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId
    const user2 = req.body.id

    if (!user1 || !user2)
      return res.status(400).send("Both user ID's are required.")

    let conversation = await Conversation.findOne({
      members: { $all: [user1, user2] }
    })

    if (!conversation) {
      conversation = await Conversation.create({
        members: [user1, user2],
        timestamp: new Date()
      })
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    }).sort({ timestamp: 1 })

    return res.status(200).send({ conversation, messages })
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server error.')
  }
}

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send('File is required')
    }

    const date = Date.now()
    let fileDir = `uploads/files/${date}`
    let fileName = `${fileDir}/${req.file.originalname}`

    mkdirSync(fileDir, { recursive: true })

    renameSync(req.file.path, fileName)

    return res.status(200).send({ filePath: fileName })
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server error.')
  }
}

module.exports = { getMessages, uploadFile }
