const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    adminkey:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        default:null
    }
},{collection:'admin'})

module.exports=mongoose.model('Admin',adminSchema)