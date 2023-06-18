const mongoose = require('mongoose')
const wishlistSchema = mongoose.Schema({
    user_id: {
        type: String,
        required:true
    },
    products: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    }]
})

module.exports = mongoose.model('Wishlist', wishlistSchema)