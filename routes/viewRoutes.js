const express = require("express");
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')

const router = express.Router()

//router.get('/subnit-user-data',authController.protect,viewsController.updateUserData)



router.get('/',authController.isLoggedIn,bookingController.createBookingCheckout,viewsController.getOverview)
router.get('/login',authController.isLoggedIn,viewsController.login)
router.get('/me',authController.protect,viewsController.getMe)
router.get('/my-tours',authController.protect,viewsController.getMyTours)

router.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
    next();
  });

  router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour)




module.exports = router