
const mongoose = require("mongoose");
const slugify = require('slugify')

const tourSchema = mongoose.Schema({
    name : {
        type : String,
        required : [true,'The tour must have a name'],
        unique : true,
        //validate: [validator.isAlpha,'Tour name must only contain letters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true,'The tour must have a duration']
    },
    maxGroupSize: {
        type: Number
    },
    difficulty:{
        type: String,
        required: [true,'The tour must have a difficulty'],
        enum: {
            values: ["easy","medium","difficult"],
            message: 'The tour difficulty must be easy or medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        set: val => Math.round(val*10)/10,
        min: [1,'The tour must have rating above 0'],
        max: [5,'The tour must have rating below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0 
    },
    price: {
        type: Number,
        required : [true, 'The tour must have a price']
    },
    priceDiscount: 
    {
        type: Number,
        validate: {
            validator: function(val){
            return val <= this.price
        },
        message: 'Discount must be less than or equal  price'
    },
    
    },
    summary: {
        type: String,
        required: [true,'The tour must have a summary'],
        trim: true
    },
    description: {
        type: String,
        required: [true,'The tour must have a description'],
        trim: true
    },
    imageCover: {
        type: String,
        required: [true,'The tour must have a cover image']
    },
    images:[String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [{
        date: Date,
        participants: {
            type: Number,
            // validate: {
            //     validator: function(el){
            //         console.log(el,this.maxGroupSize)
            //         return el <= this.maxGroupSize
            //     },
            //     message: `this tour with this date is sold out`
            // },
            default: 0
        },
            soldOut: {
                type: Boolean,
                default: false
            }
    }],
    secretTour:{
        type: Boolean,
        default:false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates:{
            type:[Number],
            index: '2dsphere'
        },
        address: String,
        description: String
    },
    locations: [
        {
            //GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates:[Number],
            address: String,
            description: String,
            day: Number
        },
    ],
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})

tourSchema.virtual('durationInWeeks').get(function(){
    return Math.ceil(this.duration/7)
})

// Virtual Populate
tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//DOCUMENT MIDDLEWARE (run before .save() and .create())
tourSchema.pre('save',function(next){
    console.log(this)
this.slug = slugify(this.name,{lower:true})
next()
})





// tourSchema.pre('save',async function(next) {
//     const guodesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guodesPromises)
//     next()
// })

//QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next){
this.find({secretTour:{$ne:true}})
next()
})

tourSchema.pre(/^find/,function(next){
    this.populate({
        path: 'guides',
        select: '-__v -createdAt -passwordChangedAt'
    })
    next()
})

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    
//     next()
// })

const Tour = mongoose.model('Tour',tourSchema)
module.exports = Tour