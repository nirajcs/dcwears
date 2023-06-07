const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    user:{
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
    products:[
        {
            productid:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type: Number,
                required: true,
                default: 1,
            },
            size:{
                type:String,
                required:true
            }
        }
    ],
    total:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"Pending"
    },
    address:{
        type:String,
        required:true
    },
    payment_method:{
        type:String,
        required:true
    },
    orderDate:{
        type:Date,
        required:true
    },
    return:{
        status:{
            type:Boolean,
            default:false
        },
        reason:{
            type:String,
            required:false
        }
    }
});

module.exports=mongoose.model("Order",orderSchema)