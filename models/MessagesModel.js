const { default: mongoose } = require('mongoose')

const MesssagesModel = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversations',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file'],
    required: true
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === 'text'
    }
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === 'file'
    }
  },

  isSeen: { type: Boolean, default: false },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

MesssagesModel.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

MesssagesModel.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() })
  next()
})
const Message = mongoose.model('Messages', MesssagesModel)

module.exports = Message
