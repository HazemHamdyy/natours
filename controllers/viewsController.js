const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Booking = require("../models/bookingModel")


exports.getOverview = catchAsync(async (req,res,next)=>{
    const tours = await Tour.find()
    res.status(200).render('overview',{
        title: 'All tours',
        tours
    })
}
)

exports.getTour = catchAsync(async (req,res,next)=>{
    const tour = await Tour.findOne({slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
    })

    if(!tour){
        return next(new AppError(`There's no tour with that name.`,404))
    }
    res.status(200).render('tour',{
        title: tour.name,
        tour
    })
})

exports.login = (req,res) => {
    res.status(200).render('login',{
        title:'Log in'
    })
}

exports.getMe = (req,res,next) => {
    res.status(200).render('account',{
        title:'Your Account'
    })
}

exports.getMyTours =catchAsync(async (req,res,next) => {
    const bookings = await Booking.find({user:req.user.id})

    const tourIDs = bookings.map(el => el.tour)
    
    const tours = await Tour.find({_id : { $in : tourIDs}})
    res.status(200).render('overview',{
        title: 'My tours',
        tours
    })
})
//s.updateUserData = catchAsync(async (req,res,next)=> {
//     const user = await User.findByIdAndUpdate(req.user.id,{
//         name:req.body.name,
//         email: req.body.email
//     },
//     {

//         new: true,
//         runValidators:true
//     }
//     )
//     res.status(200).render('account',{
//         title:'Your Account',
//         user
//     })

// })