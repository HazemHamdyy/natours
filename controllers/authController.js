const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const {promisify} = require('util')
const crypto = require('crypto')

const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const signTokenForEmailVerification = id => {
    return jwt.sign({id},process.env.JWT_SECRET_TWO,{
        expiresIn:'10m'
    })
}


const createAndSendToken = (user,statusCode,res,isCreateUser,req)=>{
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure
    }
   // if(req.secure || req.headers['x-forwarded-proto'] === 'https')  cookieOptions.secure = true


    res.cookie('token',token,cookieOptions)

    if(isCreateUser){
    user.password = undefined
    user.isActive = undefined
    res.status(statusCode).json({
        status:"success",
        token,
        data: {
            user: user
        }
   })
}else{
    res.status(statusCode).json({
        status:"success",
        token
   })
}
}

exports.protect = catchAsync(async (req,res,next)=>{
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.token){
        console.log(req.cookies.token)
        token = req.cookies.token
    }

    if(!token){
        return next(new AppError('You are not logged in!',401))
    }

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)

    const freshUser = await User.findById(decoded.id)

    if(!freshUser){
        return next(new AppError('The User belongs to this token does no longer exist.',401))
    }

    if(freshUser.isPasswordChangedAfter(decoded.iat)){
        return next(new AppError('User recently changed password. Please log in again',401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser
    res.locals.user = freshUser
    next()
})

// Only for rendering the view pages
exports.isLoggedIn = async (req,res,next)=>{
 
   if(req.cookies.token){
    try{
    const decoded = await promisify(jwt.verify)(req.cookies.token,process.env.JWT_SECRET)

    const freshUser = await User.findById(decoded.id)

    if(!freshUser){
        return next()
    }

    if(freshUser.isPasswordChangedAfter(decoded.iat)){
        return next()
    }

    // THERE IS A LOGGED IN USER
    res.locals.user = freshUser
}catch(err){
    return next()
}
}
next()
}

exports.signup = catchAsync(async (req,res,next)=>{
    //TODO email varification
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    })
    const token = signTokenForEmailVerification(newUser.id)
    const url = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${token}`
    console.log(url)
    await new Email(newUser,url).sendEmailVerification()
    res.status(201).json({
        status:"success",
        message: 'Email Verification has been send.'
   })
})

exports.verifyEmail = catchAsync(async (req,res,next) => {
    const token = req.params.token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET_TWO)

    const freshUser = await User.findById(decoded.id)

    if(!freshUser){
        return next(new AppError('The User belongs to this token does no longer exist.',401))
    }
    const token2 = signToken(freshUser._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    }
  //  if(req.secure || req.headers['x-forwarded-proto'] === 'https')  cookieOptions.secure = true


    res.cookie('token',token2,cookieOptions)
    res.locals.user = freshUser
    res.redirect(`${req.protocol}://${req.get('host')}/`)
})

exports.login = catchAsync(async (req,res,next)=>{
    const {email,password} = req.body
    if(!email || !password){
      return  next(new AppError(`Please provide email and password`,400))
    }
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.isCorrectPassword(password,user.password))){
        return next(new AppError(`Invalid Credentials`,401))
    }

    createAndSendToken(user,200,res,false,req)

//     const token = signToken(user._id)
//     res.status(200).json({
//         status:"success",
//         token
//    })
})

exports.logout = (req,res) => {
    const cookieOptions = {
        expires: new Date(Date.now() +  10 * 1000),
        httpOnly: true
    }
    res.cookie('token',"loggedOut",cookieOptions)
    // res.status(200).json({
    //     status: "success"
    // })
    res.redirect(`${req.protocol}://${req.get('host')}/`)
}



exports.restrictTo =  (...roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError(`You don't have permission to perform this action.`,403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError(`There's no user with this email`,404))
    }

    const resetToken = user.createPasswordResetToken()

    await user.save()


   // const message = `Forgot your password? Submit a PATCH request with your new password and confirm password to: ${resetUrl} .\nIf you didn't forget your password, please ignore this email!`

    try{
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`
    // await sendEmail({
    //     email: req.body.email,
    //     subject: 'Your password reset token (valid for 10 min)',
    //     message
    // })
    await new Email(user,resetUrl).sendPasswordReset()
    res.status(200).json({
        status: "success",
        message: "Token sent to email successfully"
    })
}catch(err){
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined
    await user.save()

    return next(new AppError('There was an error sending the email. Please try again later!',500))
}

})

exports.resetPassword = catchAsync(async (req,res,next) => {

    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({passwordResetToken: hashToken,PasswordResetExpires:{$gt:Date.now()}})

    if(!user) {
        return next(new AppError('Token is invalid or has expired!',400))
    }

    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.PasswordResetExpires = undefined
    await user.save()

    createAndSendToken(user,200,res,false,req)


//     const token = signToken(user._id)
//     res.status(200).json({
//         status:"success",
//         token
//    })

})

exports.updatePassword = catchAsync(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password')
    if(!(await user.isCorrectPassword(req.body.currentPassword,user.password))){
        return next(new AppError('Invalid current password',401))
    }

    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword

    await user.save()

    createAndSendToken(user,200,res,false,req)

//     const token = signToken(user._id)
//     res.status(200).json({
//         status:"success",
//         token
//    })

})