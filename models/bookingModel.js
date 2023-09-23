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
    selectedDate : {
        type: Date,
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
        return (this.selectedDate === date.date) && (date.soldOut === false)
    })
    if(!date) {
       return next(new AppError(`this tour date is sold out. Please choose another date`))
    }
    const ind =  tour.startDates.findIndex(el => this.selectedDate === el.date) 
    tour.startDates[ind].participants += 1
    tour.startDates[ind].soldOut = tour.startDates[ind].participants === tour.maxGroupSize
    await tour.save()

    next()
})

const Booking = mongoose.model('Booking',bookingSchema)

module.exports = Booking