const mongoose = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required : [true,'The user must have a name']
    },
    email: {
        type: String,
        required: [true, 'The user must have aa email'],
        unique: [true, 'This email is already in use'],
        lowerCase: true,
        validate: [validator.isEmail,`Please enter valid email`],

    },
    password: {
        type: String,
        required: [true, 'The user must have a password'],
        validate: [validator.isStrongPassword,`Password must be strong `],
        select:false
    },
    confirmPassword: {
        type: String,
        required: [true, 'User must enter the confirm password'],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: `Password doesn't match confirm password`
        },
        select: false
    },
    role:{
        type: String,
        enum : ['user','guide','lead-guide','admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    PasswordResetExpires: Date,
    isActive: {
        type: Boolean,
        default: true,
        select: false
    }

})

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
     this.password = await bcrypt.hash(this.password, 12)
     this.confirmPassword = undefined
     if(!this.isNew){
        console.log(`that's not new`)
        this.passwordChangedAt = Date.now() - 1000
     }
    }
    return next()
})

userSchema.pre(/^find/,function(next){
    this.find({isActive:{$ne : false}})
    next()
})

userSchema.methods.isCorrectPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.isPasswordChangedAfter =  function(jwtTimeStamp){
    
    //False means that password not changed after the token which is ok
    if(this.passwordChangedAt){
        return jwtTimeStamp < Math.ceil(this.passwordChangedAt.getTime()/1000)
    }
    return false
}

userSchema.methods.createPasswordResetToken = function(){
    resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex')
    this.PasswordResetExpires = Date.now() + 10 * 60 * 1000

   

    return resetToken
}

const User = mongoose.model('User',userSchema)
module.exports = User