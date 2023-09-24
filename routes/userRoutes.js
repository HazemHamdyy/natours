const express = require("express");

const userController = require('../controllers/userController')
const authController = require('../controllers/authController')



const router = express.Router()

// Protext all routes after this middleware
router.use(authController.protect)

router.patch('/update-me',userController.uploadUserPhoto,
userController.resizeUserPhoto,
userController.updateMe)
router.delete('/delete-me',userController.deleteMe )
router.get('/me',userController.getMe,userController.getUserById)

// restrict this routes to only admins
router.use(authController.restrictTo('admin'))

router.route('/').get(authController.protect,authController.restrictTo('admin'),userController.getAllUsers)

router.route('/:id').get(userController.getUserById)
.patch(userController.deleteEmailAndPasswordUpdating,
    userController.updateUser)
.delete(userController.deleteUser)

module.exports = router