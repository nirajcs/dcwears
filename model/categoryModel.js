const mongoose = require('mongoose')

const categorySchema=new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('Category',categorySchema)