const Review = require('../models/reviewModel')
const APIFeatures = require("../utils/apiFeatures")
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')



// exports.checkUserAuthority = (req,res,next) => {
//     if(req.user.id !== )
// }

exports.setTourAndUserId = (req,res,next) => {
    req.body.tour = req.body.tour ?? req.params.tourId
    req.body.author = req.user.id
    next()
}

exports.deleteTourAndUserUpdating = (req,res,next)=>{
    delete req.body['author']
    delete req.body['tour']
    next()
}

exports.getAllReviews = factory.getAll(Review)
exports.getReviewById = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)