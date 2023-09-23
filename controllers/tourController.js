
const multer = require('multer')
const sharp = require('sharp')
const Tour = require("../models/tourModel")
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

const multerStorage = multer.memoryStorage()
const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
      return  cb(new AppError('Not an image! Please upload only images.',400))
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadToutImages = upload.fields([{
    name: 'imageCover',
    maxCount: 1
},
{
    name: 'images',
    maxCount: 3
}
])

exports.resizeTourImages = catchAsync(async (req,res,next)=>{
    //console.log(req.files)
    if(req.files){
   if(req.files.imageCover){
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333).
    toFormat('jpeg')
    .jpeg({ quality: 90})
    .toFile(`public/img/tours/${req.body.imageCover}`)
   }
   if(req.files.images){
    req.body.images = []
    await Promise.all( req.files.images.map(async (image,i) => {
        const imageFileName = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
        
        await sharp(image .buffer)
        .resize(2000,1333).
        toFormat('jpeg')
        .jpeg({ quality: 90}) 
        .toFile(`public/img/tours/${imageFileName}`)
        req.body.images.push(imageFileName)
    })
    )
   
    }
   
}
    next()
})

exports.aliasTopTours = async (req,res,next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next()
}





exports. getTourStats = catchAsync( async (req,res,next) => {
 
      const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage : { "$gte" : 4.5}}
        },
        {
            $group: {
                _id : {$toUpper: '$difficulty'},
                totalTours: {$sum: 1},
                totalRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            },
            
        },
        {
        $sort: {
            avgPrice:1
        },
    }
      ])
      res.status(200).json({
        status: 'success',
        results: stats.length,
        data:{
            stats
        }
    }  )
}
)

exports.getMonthlyPlan = catchAsync(async (req,res,next) =>{
 
      const year = req.params.year *1
      const plan = await Tour.aggregate([
        {
            $unwind : '$startDates'
        },
        {
            $match: {
                startDates:{
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id: {
                    $month:'$startDates'
                },
                totalMonthTours: {
                    $sum:1
                },
                tours:{
                    $push:'$name'
                }
            }
        },
        {
            $sort:{
                totalMonthTours:-1
            }
        },
        {
            $addFields:{
                month:'$_id'
            }
        },
        {
            $project:{
                _id:0
            }
        }
      ])
      res.status(200).json({
        status: 'success',
        results: plan.length,
        data:{
            plan
        }
    })
   
}
)

exports.getToursWithin = catchAsync(async (req,res,next) => {
    const {distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')

    const radius = unit === 'mi' ? distance/3963.2 : unit === 'km' ? distance/6378.1 : undefined
    if(!radius)
    {
        return next(new AppError('Please provide unit in format mi or km.',400))
    } 

    if(!lat || !lng){
        return next(new AppError('Please provide latitude and longitude in format lat,lng.',400))
    }
    const filter = {startLocation: {$geoWithin: {$centerSphere: [[lng,lat],radius]}}}
    const tours = await Tour.find(filter)
    res.status(200).json({
        status: 'succes',
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req,res,next)=>{
    const { latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : unit === "km" ? 0.001 : undefined
    if(!multiplier){
        return next(new AppError('Please provide unit in format mi or km.',400))
    }

    if(!lat || !lng){
        return next(new AppError('Please provide latitude and longitude in format lat,lng.',400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier: multiplier
            }
        },{
            $project:{
                distance:1,
                name:1
            }
        }
    ])

    res.status(200).json({
        status: 'succes',
        data: {
            data: distances
        }
    })

})

exports.getAllTours = factory.getAll(Tour)
exports.getTourById = factory.getOne(Tour,{path: 'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
