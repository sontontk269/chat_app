const { default: mongoose } = require('mongoose')

const ConversationModel = new mongoose.Schema({
  members: [{ type: mongoose.Schema.ObjectId, ref: 'User', required: true }],
  lastMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Messages',
    required: false,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const Conversation = mongoose.model('Conversations', ConversationModel)
module.exports = Conversation
