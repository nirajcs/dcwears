const mongoose = require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    address:[
        {
            address_type:{
                type:String,
                required:false
            },
            address:{
                type:String,
                required:false
            }
        }
    ],
    password:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        default:null
    },
    is_verified:{
        type:String,
        default:0
    },
    is_blocked:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('User',userSchema)