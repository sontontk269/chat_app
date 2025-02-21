const { Router } = require('express')
const verifyToken = require('../middlewares/AuthMiddleware')
const { searchContacts, getContactForDMList, getAllContacts } = require('../controllers/ContactsController')

const contactsRoutes = Router()

contactsRoutes.post('/search', verifyToken, searchContacts)
contactsRoutes.get('/get-contacts-for-dm', verifyToken, getContactForDMList)
contactsRoutes.get('/get-all-contacts', verifyToken, getAllContacts)

module.exports = contactsRoutes
