const express = require('express');
const router = express.Router();

const {
    login, 
    signup,
    getNumber,
    deleteUser,
    saveData, 
    getData,
    logout
} = require('../controllers/userController.js');

const authMiddleware = require('../middleware/auth.js');

router.post('/signup', signup);
router.post('/login', login);
router.get('/getNumber', authMiddleware, getNumber);
router.delete('/deleteUser', authMiddleware, deleteUser);
router.put('/saveData', authMiddleware, saveData);
router.get('/getData', authMiddleware, getData)
router.get('/logout', logout)

module.exports = router