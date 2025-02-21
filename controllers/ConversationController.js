const { default: mongoose } = require('mongoose')
const Conversation = require('../models/ConversationModel')

const getConversations = async (req, res, next) => {
  try {
    let { userId } = req
    userId = new mongoose.Types.ObjectId(userId)
    const conversations = await Conversation.aggregate([
      { $match: { members: userId } },
      {
        $lookup: {
          from: 'messages',
          let: { conversationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$conversationId', '$$conversationId']
                }
              }
            },
            { $sort: { timestamp: -1 } },
            { $limit: 1 }
          ],
          as: 'lastMessage'
        }
      },
      { $addFields: { lastMessage: { $arrayElemAt: ['$lastMessage', 0] } } },
      {
        $project: {
          _id: 1,
          members: 1,
          lastMessage: 1,
          timestamp: 1
        }
      }
    ])

    return res.status(200).json({ conversations })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
module.exports = {
  getConversations
}
