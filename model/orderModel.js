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
            },
            offerPrice:{
                type:Number
            },
            status:{
                type:String,
                default:"Pending"
            },
            return:{
                status:{
                    type:Boolean,
                    default:false
                },
                reason:{
                    type:String,
                    required:false
                },
                pickup:{
                    type:Boolean,
                    default:false,
                }
            }
        }
    ],
    total:{
        type:String,
        required:true
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
    }
});

module.exports=mongoose.model("Order",orderSchema)