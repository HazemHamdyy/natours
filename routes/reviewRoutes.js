const express = require('express')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const router = express.Router({mergeParams:true})

router.use(authController.protect)

router.route('/')
.get(reviewController.getAllReviews)
.post( authController.restrictTo('user'), 
    reviewController.setTourAndUserId,
    reviewController.createReview)

router.route('/:id').get(reviewController.getReviewById)
    .patch(authController.restrictTo('admin', 'user'),
    reviewController.deleteTourAndUserUpdating,
    reviewController.updateReview)
    .delete(authController.restrictTo('admin', 'user'),
        reviewController.deleteReview)

module.exports = router