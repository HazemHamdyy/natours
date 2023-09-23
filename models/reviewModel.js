const mongoose = require("mongoose");
const Tour = require('./tourModel')
const Booking = require('./bookingModel')
const AppError = require('../utils/appError')

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true,'Please add the review text']
    },
    rating: {
        type: Number,
        required: [true, 'Please add rate for this tour'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'The review must belong to user']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true,'The review must belong to tour']
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.index({tour:1,author:1},{unique:true})

reviewSchema.statics.calcAvrageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                totalRating: {$sum : 1},
                avgRating : {$avg: '$rating'}
            }
        }
    ])
    await Tour.findByIdAndUpdate(tourId,{
        ratingsAverage: stats[0] ? stats[0].avgRating : 4.5,
        ratingsQuantity: stats[0] ? stats[0].totalRating : 0
    })
}

reviewSchema.pre('save',async function(){
   const booking =  await  Booking.findOne({tour: this.tour,user:this.user})
   if(!booking){
    next(new AppError(`Sorry! you didn't book this tour before, So you can't review on it`,400))
   }
   next()

 })

reviewSchema.post('save',async function(){
   await  this.constructor.calcAvrageRatings(this.tour)
})



reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'author',
        select: 'name photo'
    })
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // })
    next()
})

// reviewSchema.pre(/^findOneAnd/,async function(next){
//     this.r = await this.findOne()
    
//     next()
// })

reviewSchema.post(/^findOneAnd/,async function(doc){
 await doc.constructor.calcAvrageRatings(doc.tour)
})

const Review = mongoose.model('Review',reviewSchema)
module.exports = Review