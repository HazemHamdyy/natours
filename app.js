const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const authRouter = require('./routes/authRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes') 

const AppError = require('./utils/appError')
const errorHandler = require('./controllers/errorController')
const { default: helmet } = require('helmet')

const app = express()

app.set('view engine', 'pug')
app.set('views',path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname,'public')))

app.use(helmet.contentSecurityPolicy({
    directives: {
        scriptSrc: ["'self'", "https://js.stripe.com/v3/"],
        connectSrc: ["'self'", "ws://localhost:62097/"],
      },
}))
if(process.env.NODE_ENV === "development"){
app.use(morgan('dev'))
}

const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again in an hour'
})

app.use('/api',limiter)

// Body parser, reading data from body into req.body
app.use(express.json({
    limit:'10kb'
}))

app.use(express.urlencoded({
    extended: true,
    limit:'10kb'
}))

app.use(cookieParser())

// Data sanitization against NoSql query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameters pollutions
app.use(hpp({
    whitelist:['duration','ratingsAverage','ratingsQuantity','name','duration','maxGroupSize','difficulty','price']
}))

app.use('/',viewRouter)
app.use('/api/v1/tours/',tourRouter)
app.use('/api/v1/users/',userRouter)
app.use('/api/v1/auth/',authRouter)
app.use('/api/v1/reviews/',reviewRouter)
app.use('/api/v1/bookings/',bookingRouter)


app.all('*',(req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl}`,404))
})

app.use(errorHandler)




module.exports = app