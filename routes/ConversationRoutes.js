const { Router } = require('express')
const verifyToken = require('../middlewares/AuthMiddleware')
const { getConversations } = require('../controllers/ConversationController')

const conversationRoutes = Router()

conversationRoutes.get('/get-conversations', verifyToken, getConversations)
module.exports = conversationRoutes
