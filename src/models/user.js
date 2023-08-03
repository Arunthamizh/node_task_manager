const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task');

// const Task = require('../models/task');
const userSchema  = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type: String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
            throw new Error('Email is invalid');
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cannot contain')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        // custom validation below
        validate(value){
            if(value < 0){
                throw new Error('Enter the positive value')
            }
        }
    },
    tokens:[{
       token:{
           type:String,
           required:true
       }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps: true
})

// creating Virtual property

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


// .method are accessable by instances called as instance methid
// userSchema.methods.genetrateJWSToken = async (data)=>{
//     debugger
//     const user1 = this
//     const user = data
//     const token = jwt.sign({ _id: user.id.toString()},'jwtToken')
//      user.tokens.concat({token})
//     await user.save()
//     return token,user

// }

// this function is called automatically the toJSON method is called in mongoose when object is send to send() method
// userSchema.methods.getPublicProfile = function (){
    userSchema.methods.toJSON = function () {
        const user = this
        const userObject = user.toObject()

        delete userObject.password
        delete userObject.tokens
        // remove the avatar it large data it slow the JSON responce
        // we get seperate endpoint
        delete userObject.avatar

        return userObject
    }

    userSchema.methods.generateAuthToken = async function () {
        const user = this
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECERT_KET)

        user.tokens = user.tokens.concat({ token })
        await user.save()

        return token
    }

//findByCredentials is the method create in model into the statics and used  in route
// static method accessable my model called as model method
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email});
    if(!user) {
        throw  new Error ('Unable to login')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        throw new Error('Unable to login')
    }
    // throw new Error('Login successlully')
    return user
}

// Hashing the plain test password before saving
// middleware schema method is [.pre (before an event), .post (after an event)]
//      arrow function ()=>  wil not work here below in schema method
userSchema.pre('save', async function(next){
    // access the individual user in "this" object  before save to the document in the users collection
    const user = this
    if(user.isModified('password')){
        console.log('Password hashed')
        user.password = await bcrypt.hash(user.password, 8);
    }
    // console.log('just before saving')


    // The next is called for tell the before saving function operation is done
    //  the next() tell means is contain user process to save
    next()
})


// Delete task before removing the user
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    console.log("Task deleted successfully");
    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User
