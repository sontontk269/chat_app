const { Router } = require('express')
const verifyToken = require('../middlewares/AuthMiddleware')
const { getMessages, uploadFile } = require('../controllers/MessageController')
const multer = require('multer')

const messagesRoutes = Router()
const upload = multer({ dest: 'uploads/files' })
messagesRoutes.post('/get-messages', verifyToken, getMessages)
messagesRoutes.post(
  '/upload-file',
  verifyToken,
  upload.single('file'),
  uploadFile
)

module.exports = messagesRoutes
