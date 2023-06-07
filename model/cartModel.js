const mongoose = require('mongoose')

const cartSchema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    total:{
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
    ]
})

module.exports=mongoose.model("Cart",cartSchema)