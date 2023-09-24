const mongoose = require("mongoose");
const Tour = require('./tourModel')
const AppError = require('../utils/appError')


const bookingSchema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true,'The booking must belong to tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'The booking must belong to user']
    },
    price: {
        type: Number,
        required: [true,'The booking must have a price']
    },
    selectedDateID : {
        type: String,
        required: [true,'You Must select the date of the tour']
    
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})

bookingSchema.pre(/^find/,function(next) {
    this.populate({
        path: 'user',
        select: 'name email'
    }).populate({
        path: 'tour',
        select: 'name'
    })
    next()
})

bookingSchema.pre('save',async function(next){
    const tour = await Tour.findById(this.tour)

    const date = tour.startDates.filter(date => {
        return (this.selectedDateID == date._id) && (date.soldOut === false)
    })
    if(date.length === 0) {
       return next(new AppError(`this tour date is sold out or doesn't exist. Please choose another date`))
    }
    const ind =  tour.startDates.findIndex(el => this.selectedDateID == el._id) 
    tour.startDates[ind].participants += 1
    tour.startDates[ind].soldOut = tour.startDates[ind].participants === tour.maxGroupSize
    await tour.save()

    next()
})

bookingSchema.post(/^findOneAndDelete/,async function(doc){
    console.log(doc)
    // const booking = await Booking.findById(this._conditions._id)
    // console.log(booking)
     const tour = await Tour.findById(doc.tour._id)
     const ind =  tour.startDates.findIndex(el => doc.selectedDateID == el._id) 
    tour.startDates[ind].participants -= 1
    tour.startDates[ind].soldOut = tour.startDates[ind].participants === tour.maxGroupSize
    await tour.save()
})

const Booking = mongoose.model('Booking',bookingSchema)

module.exports = Booking