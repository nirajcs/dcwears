const config = require('../config/config')
const Admin = require('../model/adminModel')
const Product = require('../model/productModel')
const UserList = require('../model/userModel')
const Category =require('../model/categoryModel')
const Order = require('../model/orderModel')
const Banner =require('../model/bannerModel')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const sharp = require('sharp')


//LOGIN AUTHENTICATION
//Middlewares are used between each server action to check
//wheather the admin is logged in or not
const isAdminLogIn=(req,res,next)=>{
    try {
        if(req.session.adminLoggedIn){
            next()
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message)
    }
    
}

const isAdminLogout=(req,res,next)=>{
    try {
        if(req.session.adminLoggedIn){
            res.redirect('/admin/adminhome')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

//PAGE LOAD
//loads admin login
const adminLoginLoad = (req,res)=>{
    try {
        res.render('admin/login')
    } catch (error) {
        console.log(error.message)
    }
}

//loads products at admin side
const adminProductLoad=async(req,res)=>{
    try {
        const products=await Product.find({}).lean()
        // const allProducts = products.map(prod => {
        //     return({
        //         _id: prod._id,
        //         name: prod.name,
        //         price: prod.price,
        //         description: prod.description,
        //         image:prod.image
        //     })
        // })
        // console.log(allProducts)
        res.render('admin/home',{productData:products})
    } catch (error) {
        console.log(error.message);
    }
}

//userlist load
const usersListLoad=async(req,res)=>{
    try {
        const users=await UserList.find({}).lean()
        console.log(users)
        res.render('admin/userlist',{users})
    } catch (error) {
        console.log(error.message)
    }
}

//dash board load
const dashboardLoad=async (req,res)=>{
    try {
        let productCount = await Product.countDocuments({})
        let userCount = await UserList.countDocuments({})
        let orderCount = await Order.countDocuments({})
        let statusCount = await Order.aggregate([
            {
                $group:{
                    _id:'$status',
                    count:{$sum:1},
                    returnCount:{
                        $sum:{
                            $cond:[{$eq:['$return.status',true]},1,0]
                        }
                    }
                }
            }
        ])
        console.log(statusCount)
        let dashboardDetails = {
            products:productCount,
            users:userCount,
            orders:orderCount
        }
        res.render('admin/dashboard',{dashboardDetails,statusCount:JSON.stringify(statusCount)})
    } catch (error) {
        console.log(error.message)
    }
}

//ADD BANNER
//Banner collection is required and only one banner is set active
const addBanner=async(req,res)=>{
    try {
        let bannerData=await Banner.find({}).lean()
        res.render('admin/banners',{bannerData})
    } catch (error) {
        
    }
}

const bannerImage=async(req,res)=>{
    try {
        let bannerData=req.body
        const banner=new Banner({
            name:bannerData.heading,
            image:req.file.filename
        })
        let success=await banner.save()
        if(success){
            console.log("Banner Added Successfully")
        }
        res.redirect('/admin/addbanners')
    } catch (error) {
        console.log(error.message)
    }
}

const activateBanner=async(req,res)=>{
    try {
        let id=req.params.id
        await Banner.updateMany({},{$set:{activate:false}})
        let activateBanner = await Banner.findByIdAndUpdate(id,{activate:true})
        if(activateBanner){
            console.log("Activated Succesfully")
        }
        res.redirect('/admin/addbanners')
    } catch (error) {
        console.log(error.message)
    }
}

const removeBanner=async(req,res)=>{
    try {
        let id = req.params.id
        let deleteBanner = await Banner.findByIdAndDelete(id)
        if(deleteBanner){
            console.log("Banner Deleted")
        }
        res.redirect('/admin/addbanners')
    } catch (error) {
        console.log(error.message)
    }
}

//USER BLOCK
//is_blocked field is set true or false as per the admin clicks
const userBlock=async(req,res)=>{
    try {
        const userId=req.query.id
        await UserList.findByIdAndUpdate({_id:userId},{$set:{is_blocked:true}})
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error.message)
    }
}

const userUnblock=async(req,res)=>{
    try {
        const userId=req.query.id
        await UserList.findByIdAndUpdate({_id:userId},{$set:{is_blocked:false}})
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error.message)
    }
}

//ADMIN LOGOUT
const adminLogout=(req,res)=>{
    try {
        delete req.session.adminLoggedIn
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
    
}

//ADMIN LOGIN
const adminVerify = async(req,res)=>{
    try {
        let key=req.body.adminKey
        let adminData=await Admin.findOne({adminkey:key})
        if(adminData){
            let pass=req.body.password
            let passwordMatch=await bcrypt.compare(pass,adminData.password)
            if(passwordMatch){
                req.session.adminLoggedIn=true
                res.redirect('/admin/adminhome')
            }else{
                res.render('admin/login',{message:'Invalid Admin password'})
            }
        }else{
            res.render('admin/login',{message:'Invalid Admin Key'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const forgetLoad = (req,res)=>{
    res.render('admin/forget-password')
}

//nodemailer for sending mails
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
            subject:'admin Password reset',
            html:'<p>Hi Admin,<b>'+otp+'</b> is your OTP for password reset.</p>'
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

const forgetVerify = async(req,res)=>{
    try {
        let admin=await Admin.findOne({adminkey:req.body.key})
        console.log(admin)
        if(admin){
            let newotp=Math.floor(100000 + Math.random() * 900000);
            sendOtpLink(admin.adminkey,newotp)
            await Admin.updateOne({_id:admin._id},{$set:{otp:newotp}})
            res.render('admin/otp-enter',{admin_id:admin._id})
        }else{
            res.render('admin/forget-password',{message:'invalid admin'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const checkOtp=async(req,res)=>{
    try {
        let enterOtp=req.body.otp
        let admin=await Admin.findOne({_id:req.body.id})
        if(admin){
            console.log(enterOtp)
            if(admin.otp===Number(enterOtp)){
                res.render('admin/reset-password',{admin_id:admin._id})
                await Admin.updateOne({_id:admin._id},{$set:{otp:null}})
            }else{
                res.render('user/otp-enter',{admin_id:admin._id,message:"Otp incorrect,Please Re-enter"})
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

const confirmPasswordCheck=(req,res,next)=>{
    try {
        let admin_id=req.body.id
        let pass=req.body.password
        let confirm_password=req.body.confirm_password
        if(pass==confirm_password){
            next()
        }else{
            res.render("admin/reset-password",{message:"Passwords doesnot match",admin_id})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
         console.log(error.message)
    }
}

const setResetPassword=async(req,res)=>{
    try {
        const resetAdmin=await Admin.findOne({_id:req.body.id})
        if(resetAdmin){
            const hashedPassword=await securePassword(req.body.password)
            const updatePassword=await Admin.updateOne({_id:resetAdmin._id},{$set:{password:hashedPassword}})
            res.render('admin/forget-password',{message:"Password Changed successfully"})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//ADD EDIT DELETE PRODUCT
const addProductLoad=async(req,res)=>{
    try {
        const categoryList=await Category.find({}).lean()
        res.render('admin/add-product',{categoryList})
    } catch (error) {
        console.log(error.message)
    }  
}

//insert product from admin side
const insertProduct=async(req,res)=>{
    try {
        const product=new Product({
            name:req.body.name,
            price:req.body.price,
            category:req.body.category,
            description:req.body.description,
            // image:req.files.map((file)=>file.filename)
        })
        const croppedImages = [];
            for (let file of req.files) {
            const croppedImage = `cropped_${file.filename}`;

            await sharp(file.path)
                .resize(500, 600, { fit: "cover" })
                .toFile(`./public/images/products/${croppedImage}`);

            croppedImages.push(croppedImage);
            }

            product.image=croppedImages
        const productData =await product.save()
        if(productData){
            res.redirect('/admin/adminproduct')
        }else{
            console.log("error upload")
        } 
    } catch (error) {
        console.log(error.message)
    }
}

// delete a specific productfrom the list
const deleteProduct=async(req,res)=>{
    try {
        let productId=req.query.id
        console.log(productId);
        const productData=await Product.findByIdAndDelete({_id:productId})
        console.log(productData)
        res.redirect('/admin/adminproduct')
    } catch (error) {
        console.log(error.message)
    }
}

//loads product loading page
const editProductLoad=async(req,res)=>{
    try {
        const categoryList=await Category.find({}).lean()
        const editProduct=await Product.findById({_id:req.query.id}).lean()
        // const editProduct = {
        //         id:editProductData._id,
        //         name: editProductData.name,
        //         price: editProductData.price,
        //         description: editProductData.description,
        //         image:editProductData.image
        //     }
        console.log(editProduct)
        res.render('admin/edit-product',{editProduct,categoryList})
    } catch (error) {
        console.log(error.message)
    }
}

//edits the product by preserving existing images
const editProduct = async (req, res) => {
    try {
      const existingProduct = await Product.findById(req.query.id);
  
      let updateFields = {
        name: req.body.name,
        price: req.body.price,
        category:req.body.category,
        description: req.body.description,
        image: existingProduct.image, // Preserve existing images
      };
  
      if (req.files && req.files.length > 0) {
        updateFields.image = req.files.map((file) => file.filename);
      }
  
      const product = await Product.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: updateFields }
      );
  
      console.log(product);
  
      if (product) {
        res.redirect('/admin/adminproduct');
      }
    } catch (error) {
      console.log(error.message);
    }
};
  
//Category Management
const categoryLoad=async(req,res)=>{
    try {
        let categories=await Category.find({}).lean()
        res.render('admin/categories',{categories,message:req.session.message})
        req.session.message=''
    } catch (error) {
        console.log(error.message)
    }
}

const addCategory=async(req,res)=>{
    try {
        let category=await Category.findOne({category:req.body.category})
        if(category){
            console.log("Category already added")
            req.session.message="Category Exists Already"
            res.redirect('/admin/category')
        }else{
            let categoryadd=new Category({
                category:req.body.category
            })
            const addSuccess=await categoryadd.save()
            if(addSuccess){
                console.log("success")
                res.redirect('/admin/category')
            }else{
                console.log("failed")
                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCategory=async(req,res)=>{
    try {
        let categoryId=req.query.id
        let deleteCategory=await Category.findByIdAndDelete(categoryId)
        if(deleteCategory){
            res.redirect('/admin/category');             
        }
    } catch (error) {
        console.log(error.message)
    }
}


//Orders
//load orders page
const loadOrders=async(req,res)=>{
    try {
        const orderList = await Order.find({}).populate('products.productid').lean()
        const allOrders = orderList.map(data => {
                return({
                    id: data._id,
                    user: data.user,
                    email: data.email,
                    mobile: data.mobile,
                    products: data.products,
                    address:data.address,
                    total:data.total,
                    status:data.status,
                    payment_method:data.payment_method
                })
            })
        // console.log(allOrders)
        // console.log(allOrders[0].products)
        res.render('admin/orders',{allOrders})
    } catch (error) {
        console.log(error.message)
    }
} 
//more info about the orders
const orderInfo=async(req,res)=>{
    try {
        let orderId=req.params.id
        console.log(orderId)
        let orders=await Order.findOne({_id:orderId}).populate('products.productid')

        let orderDetails = orders.products.map(data=>{
            return({
                id:data.productid._id,
                image:data.productid.image[2],
                name:data.productid.name,
                quantity:data.quantity,
                size:data.size,
                price:data.productid.price
            })
        })
        // console.log(orderDetails)
        res.render('admin/orderInfo',{orderDetails})
    } catch (error) {
        console.log(error.message)
    }
}
//order status updating code
const updateStatus=async(req,res)=>{
    try {
        let orderid = req.body.orderid
        let newstatus = req.body.status
        console.log(orderid)
        let status= await Order.findByIdAndUpdate(orderid,{$set:{status:newstatus}})
        if(status){
            console.log("Status updated successfully")
        }
        res.redirect('/admin/orders')
    } catch (error) {
        console.log(error.message)
    }
}
//return details of users
const returnDetails=async(req,res)=>{
    try {
        console.log("here")
        let returnDetails = await Order.find({'return.status':true}).lean()
        console.log(returnDetails)
        res.render('admin/returns',{returnDetails})
    } catch (error) {
        console.log(error.message)
    }
}
//returned products
const returnInfo=async(req,res)=>{
    try {
        let orderId=req.params.id
        console.log(orderId)
        let orders=await Order.findOne({_id:orderId}).populate('products.productid')

        let orderDetails = orders.products.map(data=>{
            return({
                id:data.productid._id,
                image:data.productid.image[2],
                name:data.productid.name,
                quantity:data.quantity,
                size:data.size,
                price:data.productid.price
            })
        })
        console.log(orderDetails)
        res.render('admin/return-info',{orderDetails})
    } catch (error) {
        
    }
}

module.exports={
    adminLoginLoad,
    dashboardLoad,
    adminProductLoad,
    forgetLoad,
    forgetVerify,
    checkOtp,
    confirmPasswordCheck,
    setResetPassword,
    usersListLoad,
    userBlock,
    userUnblock,
    adminLogout,
    adminVerify,
    addProductLoad,
    insertProduct,
    isAdminLogIn,
    isAdminLogout,
    deleteProduct,
    editProductLoad,
    editProduct,
    categoryLoad,
    addCategory,
    deleteCategory,
    loadOrders,
    orderInfo,
    addBanner,
    bannerImage,
    activateBanner,
    removeBanner,
    updateStatus,
    returnDetails,
    returnInfo
}