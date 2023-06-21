const config = require('../config/config')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Banner = require('../model/bannerModel')
const Cart = require('../model/cartModel')
const Order = require('../model/orderModel')
const Wishlist = require('../model/wishlistModel')
const Coupon = require('../model/couponModel')
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')

const pdf = require('html-pdf');
const fs = require('fs');

//RAZOR PAY
var instance = new Razorpay({
    key_id: config.KEY_ID,
    key_secret: config.KEY_SECRET, 
});
//RAZOR PAY

//PAGELOAD
//Loads the home page

const mainLoad=async(req,res)=>{
    let username=req.session.username
    let session=req.session.loggedIn
    const banner = await Banner.findOne({activate:true})
    let newProducts = await Product.find({}).sort({createdAt:-1}).limit(4).lean()
    console.log(newProducts)
    res.render('user/home',{banner:banner.image,newProducts,session,username,homeActive:true})
}

const homeLoad=async(req,res)=>{
    try {
        const categoryList=await Category.find({}).lean()
        const products=await Product.find({}).lean()
        let username=req.session.username
        let session=req.session.loggedIn
        res.render('user/products',{products,categoryList,session,username,productActive:true})
    } catch (error) {
        console.log(error.message)
    }
}

const sortProducts=async(req,res)=>{
    try {
        let sort = req.query.sort
        console.log(sort)
        const categoryList=await Category.find({}).lean()
        const products=await Product.find({}).sort({price:req.query.sort}).lean()
        let username=req.session.username
        let session=req.session.loggedIn
        res.render('user/products',{products,categoryList,session,username,productActive:true})
    } catch (error) {
        console.log(error.message)
    }
}

//Loads the page according to the mentioned category
const categorywiseLoad=async(req,res)=>{
    const categoryList=await Category.find({}).lean()
    let categoryName = req.query.category
    let products=await Product.find({category:categoryName}).lean()
    let username=req.session.username
    let session=req.session.loggedIn
    console.log(products)
    res.render('user/products',{products,categoryList,session,username,productActive:true})
}

const loginLoad=(req,res)=>{
    try {
        res.render('user/login',{title:'User Login'})
    } catch (error) {
        console.log(error.message)
    }
}

//loads the register page
//verifys using nodemailer
const registerLoad=(req,res)=>{
    try {
        res.render('user/signup',{title:"Register User"})
    } catch (error) {
        console.log(error.message)
    }
}

const sendVerifyMail=(name,email,user_id)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.ADMIN_EMAIL,
                pass:config.APP_PASSWORD
            }
        })
        const mailOptions={
            from:'DC Wears',
            to:email,
            subject:'Verify Your Mail',
            html:'<p>Hi '+name+',Please click here to <a href="http://localhost:4000/register/verify?id='+user_id+'">verify</a> your mail.</p>'
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error)
            }else{
                console.log('email has been sent to:-',info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}


//Search Product
//Searching prodducts user regex in mongoose
const searchProduct=async(req,res)=>{
    try {
        const categoryList=await Category.find({}).lean()
        let search=req.query.search
        let searchRegex=new RegExp(search,'i')
        let searchedProduct=await Product.find({name:{$regex:searchRegex}}).lean()
        let username=req.session.username
        let session=req.session.loggedIn
        res.render('user/products',{products:searchedProduct,categoryList,session,username,productActive:true})
    } catch (error) {
        console.log(error.message)
    }
}


//SIGNUP FUNCTIONS
//Hashing using bcrypt
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
         console.log(error.message)
    }
}

const passwordCheck = (req,res,next)=>{
    try {
        let password1=req.body.password
        let password2=req.body.confirm_password
        if(password1==password2){
            next()
        }else{
            res.render('user/signup',{title:"Register User",message:"Passwords does not match"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//Adding new user
const insertUser=async(req,res)=>{
    try {
        let user=req.body
        let mailCheck=await User.findOne({email:user.email})
        if(mailCheck){
            res.render('user/signup',{title:"Register User",message:"User already exists"})
        }else{
            let hashedPassword=await securePassword(user.password)
            let userBody=new User({
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:hashedPassword
            })
            let insertData=await userBody.save()
            if(insertData){
                sendVerifyMail(req.body.name,req.body.email,insertData._id)
                res.render('user/signup',{title:'Register User',message:"Successful,Please verify your mail"})
            }else{
                res.render('user/signup',{title:"Register User",message:"Registration failed!!!"})
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

//Verify existing user
const verifyMail = async(req,res)=>{
    try {
        const updateInfo=await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        console.log(updateInfo);
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}

//LOGIN FUNCTIONS
const verifyLogin=async(req,res)=>{
    try {
        let loginMail=req.body.email
        const userData=await User.findOne({email:loginMail})
        if(userData){
            let loginPassword=req.body.password
            const passwordMatch=await bcrypt.compare(loginPassword,userData.password)
            if(passwordMatch){
                console.log(userData.is_verified)
                if(userData.is_verified==0){
                    res.render('user/login',{title:"User Login",message:"Email is not verified"})
                }else{
                    if(userData.is_blocked==false){
                        req.session.loggedIn=true
                        req.session.username=userData.name
                        req.session.userId=userData._id
                        res.redirect('/')
                    }else{
                        res.render('user/login',{title:"User Login",message:"You are blocked by admin"})
                    }
                }
            }else{
                res.render('user/login',{title:"User Login",message:"incorrect password"})
            }
        }else{
            res.render('user/login',{title:'User Login',message:'User does not exist'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//OTP LOGIN
const otpLoginLoad=(req,res)=>{
    try {
        res.render('user/otp-login')
    } catch (error) {
        console.log(error.message)
    }
}

//nodemailer function for sending mails
const sendOtpLink=(email,otp)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.ADMIN_EMAIL,
                pass:config.APP_PASSWORD
            }
        })
        const mailOptions={
            from:'DC Wears',
            to:email,
            subject:'Log in with OTP',
            html:'<p>Hi,<b>'+otp+'</b> is your OTP for login</p>'
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error)
            }else{
                console.log('email has been sent to:-',info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

const otpMailVerify=async(req,res)=>{
    try {
        let newotp=await Math.floor(100000 + Math.random() * 900000);
        const otpMailCheck=await User.findOneAndUpdate({email:req.body.email},{$set:{otp:newotp}})
        console.log(newotp)
        if(otpMailCheck){
            if(otpMailCheck.is_blocked){
                res.render('user/otp-login',{title:"OTP Login",message:"Blocked by Admin"})
                await User.updateOne({_id:otpMailCheck._id},{$set:{otp:null}})
            }else{
                console.log(otpMailCheck.otp);
                sendOtpLink(otpMailCheck.email,newotp)
                res.render('user/otp-enter',{title:"OTP Login",user_id:otpMailCheck._id})
            }
        }else{
            res.render('user/otp-login',{title:"OTP Login",message:"Unregistered User"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const checkOtp=async(req,res)=>{
    try {
        let enterOtp=req.body.otp
        let loginUser=await User.findOne({_id:req.body.id})
        if(loginUser){
            console.log(enterOtp)
            console.log(loginUser.otp)
            if(loginUser.otp===Number(enterOtp)){
                req.session.loggedIn=true
                req.session.username=loginUser.name
                req.session.userId=loginUser._id
                res.redirect('/')
                await User.updateOne({_id:loginUser._id},{$set:{otp:null}})
            }else{
                res.render('user/otp-enter',{user_id:loginUser._id,message:"Otp incorrect,Please Re-enter"})
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

//FORGET FUNCTIONS
const forgetLoad=(req,res)=>{
    try {
        res.render('user/forget-password',{title:"Forget Password"})
    } catch (error) {
        console.log(error.message)
    }
}

const sendForgetVerifyMail=(email,user_id)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.ADMIN_EMAIL,
                pass:config.APP_PASSWORD
            }
        })
        const mailOptions={
            from:'DC Wears',
            to:email,
            subject:'Reset Your Password',
            html:'<p>Hi,Please click here to <a href="http://localhost:3000/forget/verify?id='+user_id+'">Reset</a> your password.</p>'
    
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error)
            }else{
                console.log('email has been sent to:-',info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

const resetPasswordLoad=(req,res)=>{
    try {
        let user_id=req.query.id
        res.render('user/reset-password',{title:"Reset Password",user_id})
    } catch (error) {
        console.log(error.message)
    }
}

const confirmPasswordCheck=(req,res,next)=>{
    try {
        let user_id=req.body.id
        let pass=req.body.password
        let confirm_password=req.body.confirm_password
        if(pass==confirm_password){
            next()
        }else{
            res.render("user/reset-password",{title:"Reset Password",message:"Passwords doesnot match",user_id})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const setResetPassword=async(req,res)=>{
    try {
        const resetUser=await User.findOne({_id:req.body.id})
        if(resetUser){
            const hashedPassword=await securePassword(req.body.password)
            const updatePassword=await User.updateOne({_id:resetUser._id},{$set:{password:hashedPassword}})
            res.render('user/forget-password',{title:"Forget Password",message:"Password Changed successfully"})
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const verifyForgetMail =async(req,res)=>{
    try {
        let userEmail=req.body.email
        const validUser=await User.findOne({email:userEmail})
        if(validUser){
            sendForgetVerifyMail(validUser.email,validUser._id)
            res.render('user/forget-password',{title:"Forget Password",message:"Mail send successfully"})
        }else{
            res.render('user/forget-password',{title:"Forget Password",message:"User not registered"})
        }
    } catch (error) {
        console.log(error.message)
    }
}


//LOGOUT
const logout=(req,res)=>{
    try {
        delete req.session.loggedIn
        delete req.session.username
        delete req.session.userId
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}


//USER PROFILE
const profileView=async(req,res)=>{
    try {
        let userId=req.session.userId
        let username=req.session.username
        let session=req.session.loggedIn
        let user=await User.findById(userId).lean()
        res.render('user/profile',{user,username,session,profileActive:true})
    } catch (error) {
        console.log(error.message)
    }
}

const profileEditAddress=async(req,res)=>{
    try {
        let {id,type,address} = req.body
        let userDetails = await User.findById(req.session.userId)
        let userAddress = userDetails.address.id(id)
        userAddress.address_type = type;
        userAddress.address = address;
        let success = userDetails.save()
        if(success){
            console.log("Edit Successful")
        }
        res.redirect('/userprofile')
    } catch (error) {
        
    }
}

const ProfileAddAddress=async(req,res)=>{
    try {
        let address = await User.updateOne(
            { _id: req.session.userId },
            {
              $push: {
                address: {
                  address_type: req.body.type,
                  address: req.body.address
                }
              }
            }
          );
    
        if(address){
            console.log("Address added successfully")
        }
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error.message)
    }
}

const profileAddressDelete=async(req,res)=>{
    try {
        let userId=req.session.userId
        let addressId=req.query.id
        let deleteAddress = await User.updateOne({_id:userId},{$pull:{address:{_id:addressId}}})
        if(deleteAddress){
            console.log("Address Deleted")
        }
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error.message)
    }
}

const sendProfileOtpLink=(email,otp)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.ADMIN_EMAIL,
                pass:config.APP_PASSWORD
            }
        })
        const mailOptions={
            from:'DC Wears',
            to:email,
            subject:'Log in with OTP',
            html:'<p>Hi,<b>'+otp+'</b> is your OTP for profile editing.</p>'
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error)
            }else{
                console.log('email has been sent to:-',info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

const profileEdit=async(req,res)=>{
    try {
        let userId=req.session.userId
        let userData = {
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile
        }
        let newotp= Math.floor(100000 + Math.random() * 900000);
        await User.findByIdAndUpdate(userId,{otp:newotp})
        sendProfileOtpLink(req.body.email,newotp)
        
        res.render('user/profile-edit-otp',{userData})
    } catch (error) {
        console.log(error.message)
    }
}

const verifyProfileOtp = async(req,res)=>{
    let userId = req.session.userId
    let user = await User.findById(userId)
    let userData = {
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mobile
    }
    let otp = user.otp
    if(otp == req.body.userotp){
        let updateData = await User.findByIdAndUpdate(
            userId,
            {
                $set:
                    {
                        name:req.body.name,
                        email:req.body.email,
                        mobile:req.body.mobile
                    }
            }
        )
        res.redirect('/userprofile')
        await User.findByIdAndUpdate(userId,{$set:{otp:null}})
    }else{
        res.render('user/profile-edit-otp',{userData,message:"incorrect OTP"})
    }
}

//PRODUCT SECTION
//loads the details of a single product
const singleProductLoad =async(req,res)=>{
    try {
        let product_id=req.query.id
        let productDetails=await Product.findById(product_id).lean()
        let categoryDetails =await Category.find({})
        console.log(productDetails)
        let username=req.session.username
        let session=req.session.loggedIn
        let isWishlist = await Wishlist.findOne({ products: { $elemMatch: { product_id: product_id } } });
        console.log(isWishlist)
        res.render('user/product-details',{category:encodeURIComponent(JSON.stringify(categoryDetails)),productDetails,username,session,isWishlist,initialImage:productDetails.image[2],productActive:true})  
    } catch (error) {
        console.log(error.message);
    }
}

//USER CART
//user cart functions
const userCart=async(req,res)=>{
    try {
        let username=req.session.username
        let session=req.session.loggedIn
        let productDetails = await Product.find({}).lean()
        let cart= await Cart.findOne({userid:req.session.userId}).populate("products.productid")
        console.log(cart)
        if (cart) {
            if (cart.products.length===0){
                res.render('user/user-cart',{title:'User Cart',username,session,message:"CART IS EMPTY",cartActive:true})
            }else{
                let products=cart.products
                let total=cart.total
                console.log(products.length);
                const cartData= products.map(prod => {
                        return({
                            prod_id: prod.productid._id.toString(),
                            name: prod.productid.name,
                            price: prod.productid.price,
                            quantity: prod.quantity,
                            offer:prod.offerPrice,
                            size:prod.size,
                            image: prod.productid.image
                        })
                    })
                    console.log(total)
                    if(products.length===0){
                        await Cart.findOneAndDelete({userid:req.session.userId})
                    }
                    
                res.render('user/user-cart',{totalPrice:total,productDetails: JSON.stringify(productDetails),cartData,username,session,cartActive:true})
            }
        }else{
            res.render('user/user-cart',{title:'User Cart',username,session,message:"CART IS EMPTY",cartActive:true})
        }
        } catch (error) {
        console.log(error.message)
    }
}

const addToCart=async(req,res)=>{
    try {
        let psize = req.body.size
        let prodId=req.body.prodId
        let userId = req.session.userId
        let offer = req.body.price
        console.log(req.body)
        console.log(psize);
        console.log(prodId);
        let userCart=await Cart.findOne({userid:userId})
        if(!userCart){
            const newCart = new Cart({userid:userId,total:0,products:[]})

            await newCart.save()
            userCart = newCart
        }

        const productIndex=userCart?.products.findIndex((product)=>(product.productid==prodId && product.size==psize))
        console.log(productIndex)
        if(productIndex==-1){
            userCart.products.push({productid:prodId,quantity:1,size:psize,offerPrice:offer})
            userCart.total+=Number(req.body.price)
        }else{
            userCart.products[productIndex].quantity+=1
        }
        await userCart.save()

        if(req.body.page=="wishlist"){
            res.redirect('/wishlist') 
        }else{
            setTimeout(() => {
                res.redirect('/productload'+'?id='+prodId)
            }, 2000);
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

//updates the cart each tym when the + or - is pressed
const updateCart=async(req,res) => {
   try {
    //  console.log(req.body); 
     let userId=req.session.userId
     let updateValues = req.body.products
     console.log(updateValues)
     for(let data of updateValues){
         const { prod_id, quantity ,size ,finalAmount} = data;
         let productDetails = await Product.findById(prod_id)
         if(productDetails.stock < quantity){
            res.send({noStock:true})
         }
         const changeCart = await Cart.updateOne(
            {
              userid: userId,
              'products.productid': prod_id,
              'products.size': size
            },
            {
              $set: {
                'products.$.quantity': quantity,
                total: finalAmount
              }
            })
         if(changeCart){
            console.log("updated Successfully");
         }
         // console.log(prod_id);
         // console.log(quantity);
        }
        res.send({isOk: true})
   } catch (error) {
    console.log(error.message);
   }
}

const deleteCart = async (req, res) => {
    try {
      const userId = req.session.userId;
      const productId = req.params.id;
      const prodSize = req.params.size
  
      console.log(productId);
      console.log(userId);
      console.log(prodSize)
  
      const deletedItem = await Cart.findOneAndUpdate(
        { userid: userId, 'products.productid': productId },
        { $pull: { products: { size: prodSize } } },
        { new: true }
      );
  
      if (deletedItem) {
        console.log('Deleted Successfully');
      }
  
      res.redirect('/cart');      
    } catch (error) {
      console.error(error.message);
    }
};


//WISHLIST
const addToWishlist = async(req,res)=>{
        try {
            let {id}=req.query
            console.log(id)
            let wishlist = await Wishlist.findOne({user_id:req.session.userId})
            if(wishlist){
                let addItem = await Wishlist.findOneAndUpdate({user_id:req.session.userId},{$push:{products:{product_id:id}}})
                if(addItem){
                    console.log("Product added to wishlist")
                }
            }else{
                let newWishlist = new Wishlist({
                    user_id:req.session.userId,
                    products:[{product_id:id}]
                })
                let newList = await newWishlist.save()
                if(newList){
                    console.log("New list created")
                }
            }
            res.redirect('/productload?id='+id)

        } catch (error) {
            console.log(error.message)
        }
}

const wishlistLoad = async(req,res)=>{
    try {
        let username=req.session.username
        let session=req.session.loggedIn
        let wishList = await Wishlist.findOne({user_id:req.session.userId}).populate('products.product_id').lean()
        console.log("CHECK")
        if (wishList) {
            if (wishList.products.length === 0) {
              res.render('user/wishlist', { message: "WISHLIST IS EMPTY", username, session, wishlistActive: true });
            } else {
              res.render('user/wishlist', { products: wishList.products, username, session, wishlistActive: true });
            }
          }else{
            res.render('user/wishlist', { message: "WISHLIST IS EMPTY", username, session, wishlistActive: true });
          }
    } catch (error) {
        console.log(error.message)
    }
}

const removeWishlist = async(req,res)=>{
    try {
        let {id} = req.query
        let removeProduct = await Wishlist.updateOne({user_id:req.session.userId},{$pull:{products:{_id:id}}})
        if(removeProduct){
            console.log("Product removed successfully")
        }
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message)
    }
}


//USER ORDERS
//order management on user side
const myOrders=async(req,res)=>{
    try {
        let username=req.session.username
        let session=req.session.loggedIn
        console.log("My orders")
        let orders=await Order.find({userid:req.session.userId}).populate('products.productid').sort({orderDate:-1})
        // console.log(orders)
        if(orders){
            let orderDetails = orders.map(data=>{
                return({
                    id:data._id,
                    date: `${data.orderDate.getDate()}-${data.orderDate.getMonth() + 1}-${data.orderDate.getFullYear()}`,
                    total:data.total,
                    products:data.products.map(details=>{
                        return({
                            id:details._id,
                            image:details.productid.image[2],
                            name:details.productid.name,
                            price:details.productid.price,
                            quantity:details.quantity,
                            size:details.size,
                            status:details.status,
                            return:details.return.status,
                        })
                    }),
                    payment:data.payment_method
                })
            })
            // console.log(orderDetails)
            res.render('user/orders',{orderProducts:encodeURIComponent(JSON.stringify(orderDetails)),orders:encodeURIComponent(JSON.stringify(orders)),username,session,orderDetails,returnErr:req.session.returnErr,orderActive:true})
            req.session.returnErr=""
        }else{
            res.render('user/orders',{username,session,message:"No Orders",noOrders:true})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const orderCancel=async(req,res)=>{
    try {
        let id=req.params.orderId
        let prodId=req.params.prodId
        let cancelOrder = await Order.findById(id).populate('products.productid')
        let total = cancelOrder.total
        console.log(total)
        console.log(id)
        let prodDetails = cancelOrder.products.find(item=>item._id==prodId)
        let prodTotal = (prodDetails.quantity*prodDetails.offerPrice)
        let newPrice = total-prodTotal
        if(newPrice<0){
            newPrice=0
        }
        console.log(newPrice)
        console.log(prodDetails)
        console.log(prodId)
        if(cancelOrder.payment_method=="Net Banking" || cancelOrder.payment_method=="Wallet"){
            await User.findByIdAndUpdate(req.session.userId,{$inc:{wallet:prodTotal}})
            console.log("Balance Added")
        }
        let cancelDetails = await Order.findOneAndUpdate({_id:id,'products._id':prodId},{ $set: { 'products.$.status': "Cancelled" } })
        if(cancelDetails){
            await Order.findByIdAndUpdate(id,{$set:{total:newPrice}})
            console.log("Cancelled successfully")
        }
    res.redirect('/orders')
    } catch (error) {
        console.log(error.message)
    }
}

const returnOrder=async(req,res)=>{
    let orderId = req.body.orderid
    let prodId = req.body.productid
    let reason = req.body.reason
    let order = await Order.findById(orderId)
    let currentDate=Date.now()
    let timeDiff=currentDate-order.orderDate
    let sevenDays= 7 * 24 * 60 * 60 * 1000; //Seven Days in milliseconds
    let withinSevenDays=timeDiff<=sevenDays
    console.log(timeDiff)
    console.log(withinSevenDays);
    if(withinSevenDays){
        await Order.findOneAndUpdate({_id:orderId,'products._id':prodId},{$set:{ 'products.$.return':{status:true,reason:reason} }})
    }else{
        req.session.returnErr="You cannot return as the number of days exceeded"
    }
    res.redirect('/orders')
}

//ORDER PAYMENT
//payment and confirmation
const orderPayment = async(req,res)=>{
    try {
        let username=req.session.username
        let session=req.session.loggedIn
        const orderDetails = await Cart.findOne({userid:req.session.userId}).lean()
        console.log(orderDetails.total)
        const userDetails  = await User.findOne({_id:req.session.userId}).lean()
        const couponDetails = await Coupon.find({}).lean()
        // console.log(userDetails.address)
        let userAddress=userDetails.address.map(data=>{
            return({
                id:data._id,
                type:data.address_type,
                address:data.address
            })
        })
        console.log(JSON.stringify(userAddress))
        res.render('user/confirm-order', { coupons:encodeURIComponent(JSON.stringify(couponDetails)), couponDetails, userDetails, userAddress: encodeURIComponent(JSON.stringify(userAddress)), message:req.session.message , orderDetails, totalPrice: orderDetails.total, username, session });
        req.session.message = ''
    } catch (error) {
        console.log(error.message)
    }
}

const addAddress = async(req,res)=>{
    try {
        let address = await User.updateOne(
            { _id: req.session.userId },
            {
              $push: {
                address: {
                  address_type: req.body.type,
                  address: req.body.address
                }
              }
            }
          );
    
        if(address){
            console.log("Address added successfully")
        }
        res.redirect('/payment')
    } catch (error) {
        console.log(error.message)
    }
}

// const generateInvoice = (orderData) => {
//     // Define the invoice template using HTML/CSS
//     const invoiceTemplate = `
//     <html>
//     <head>
//       <style>
//         /* Define CSS styles for the invoice */
//         body {
//           font-family: Arial, sans-serif;
//           margin: 0;
//           padding: 20px;
//         }
        
//         h1 {
//           text-align: center;
//         }
        
//         table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-top: 20px;
//         }
        
//         th, td {
//           padding: 10px;
//           text-align: left;
//         }
        
//         th {
//           background-color: #f2f2f2;
//         }
        
//         tr:nth-child(even) {
//           background-color: #f9f9f9;
//         }
        
//         .invoice-details {
//           margin-top: 40px;
//         }
        
//       </style>
//     </head>
//     <body>
//       <h1><u>Invoice</u></h1>
      
//       <div class="invoice-details">
//         <h2>Invoice Details</h2>
//         <p><strong>User:</strong> ${orderData.user}</p>
//         <p><strong>Email:</strong> ${orderData.email}</p>
//         <p><strong>Mobile:</strong> ${orderData.mobile}</p>
//         <p><strong>Address:</strong> ${orderData.address}</p>
//         <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
//         <p><strong>Total:</strong> ${orderData.total}</p>
//         <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
//       </div>
//     </body>
//   </html>
// `;

// // Rest of the code for generating and saving the invoice..
//     const invoiceFileName = `invoice_${orderData._id}.pdf`; // Assuming the order ID is stored in _id field
//     // Generate the PDF invoice using html-pdf module
//     pdf.create(invoiceTemplate).toFile(`downloads/${invoiceFileName}`, (err, res) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log('Invoice generated successfully!');
//         // Move the generated invoice to the downloads folder
//         fs.rename(res.filename, `downloads/${invoiceFileName}`, (error) => {
//             if (error) {
//             console.log(error);
//             } else {
//             console.log('Invoice downloaded successfully!');
//             }
//         });
//       }
//     });
// };

const confirmOrder = async(req,res)=>{
    try {
        console.log(req.body)
        let userId=req.body.userid
        let productDetails = await Cart.findOne({userid:userId}).populate('products.productid')
        console.log(productDetails.products)
        let orderData = new Order({
            userid:userId,
            user:req.body.name,
            email:req.body.email,
            mobile:req.body.phone,
            address:req.body.useraddress,
            total:req.body.total,
            payment_method:req.body.payment,
            products:productDetails.products,
            orderDate:Date.now()
        })
        if(req.body.payment == "Wallet"){
            let user = await User.findById(req.session.userId)
            let walletAmount = user.wallet
            console.log(walletAmount)
            if(req.body.total>walletAmount){
                console.log(req.body.total)
                let balance = req.body.total-walletAmount
                const amount = balance * 100;
                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: config.PAY_MAIL,
                };
            
                instance.orders.create(options, async (err, order) => {
                    if (!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        amount: amount,
                        key_id: config.KEY_ID,
                        name: req.body.name,
                        email: req.body.email,
                        mobile: req.body.phone,
                    });
                    } else {
                    res.status(400).send({ success: false, msg: 'Something went wrong' });
                    }
                });
            }else{
                await User.findByIdAndUpdate(req.session.userId,{$inc:{wallet:-req.body.total}})

                var success=await orderData.save()
            }
        }else{
            var success=await orderData.save()
        }
        if (success){
            let cart = await Cart.findOne({userid:userId})
            // Update the stock count of products
            cart.products.forEach(async (product) => {
                const productId = product.productid;
                const quantity = product.quantity;
        
                // Find the product by ID
                const foundProduct = await Product.findById(productId);
            
                // Calculate the new stock count
                const newStock = parseInt(foundProduct.stock) - parseInt(quantity);
        
                // Update the stock count in the database
                await Product.findByIdAndUpdate(productId, { stock: newStock });
            })
            await Cart.findOneAndDelete({userid:userId})
            console.log('cart also deleted')
            res.redirect('/ordersuccess')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const createOrder = async (req, res) => {
    try {
      // Razorpay Starts
      const amount = req.body.total * 100;
      const options = {
        amount: amount,
        currency: 'INR',
        receipt: config.PAY_MAIL,
      };
  
      instance.orders.create(options, async (err, order) => {
        if (!err) {
          res.status(200).send({
            success: true,
            msg: 'Order Created',
            order_id: order.id,
            amount: amount,
            key_id: config.KEY_ID,
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.phone,
          });
        } else {
          res.status(400).send({ success: false, msg: 'Something went wrong' });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
};

const orderSuccess=(req,res)=>{
    try {
        res.render('user/order-success')
    } catch (error) {
        console.log(error.message)
    }
}

const paymentSuccess=async (req,res)=>{
    try {
        console.log("Ivde vannu tta")
        console.log(req.body)
        let userId=req.body.userid
        let productDetails = await Cart.findOne({userid:userId}).populate('products.productid')
        console.log(productDetails.products)
        let orderData = new Order({
            userid:userId,
            user:req.body.name,
            email:req.body.email,
            mobile:req.body.phone,
            address:req.body.useraddress,
            total:req.body.total,
            payment_method:req.body.payment,
            products:productDetails.products,
            orderDate:Date.now()
        })

        if(req.body.payment=='Wallet'){
            await User.findByIdAndUpdate(req.session.userId,{$set:{wallet:0}})
        }

        let Datasuccess=await orderData.save()

        if (Datasuccess){
            let cart = await Cart.findOne({userid:userId})
            // Update the stock count of products
            cart.products.forEach(async (product) => {
                const productId = product.productid;
                const quantity = product.quantity;
        
                // Find the product by ID
                const foundProduct = await Product.findById(productId);
            
                // Calculate the new stock count
                const newStock = parseInt(foundProduct.stock) - parseInt(quantity);
        
                // Update the stock count in the database
                await Product.findByIdAndUpdate(productId, { stock: newStock });
            })
            await Cart.findOneAndDelete({userid:userId})
            console.log('cart also deleted')
        }

        console.log(orderData.products)

        res.redirect('/ordersuccess')

    } catch (error) {
        console.log(error.message)
    }

}

module.exports={
    mainLoad,
    homeLoad,
    sortProducts,
    categorywiseLoad,
    searchProduct,
    loginLoad,
    forgetLoad,
    verifyForgetMail,
    otpLoginLoad,
    otpMailVerify,
    checkOtp,
    resetPasswordLoad,
    confirmPasswordCheck,
    setResetPassword,
    registerLoad,
    passwordCheck,
    insertUser,
    verifyLogin,
    logout,
    verifyMail,
    singleProductLoad,
    userCart,
    addToCart,
    updateCart,
    deleteCart,
    wishlistLoad,
    addToWishlist,
    removeWishlist,
    orderPayment,
    confirmOrder,
    createOrder,
    orderSuccess,
    paymentSuccess,
    myOrders,
    orderCancel,
    returnOrder,
    addAddress,
    profileView,
    profileEditAddress,
    ProfileAddAddress,
    profileAddressDelete,
    profileEdit,
    verifyProfileOtp
}