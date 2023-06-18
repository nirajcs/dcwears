const adminController=require('../controller/adminController')
const middlewareController = require('../controller/middlewareController')
var express = require('express');
var router = express.Router();

const path = require('path')
const multer = require('multer')

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,path.join(__dirname,'../public/images/products'))
  },
  filename:(req,file,cb)=>{
      const name = Date.now()+'-'+file.originalname
      cb(null,name)
  }
})

const bannerStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,path.join(__dirname,'../public/images/banners'))
  },
  filename:(req,file,cb)=>{
      const name = Date.now()+'-'+file.originalname
      cb(null,name)
  }
})

const upload = multer({storage:storage})
const bannerUpload = multer({storage:bannerStorage})

/* Admin login */
router.get('/',middlewareController.isAdminLogout,adminController.adminLoginLoad)
router.post('/',adminController.adminVerify)
router.get('/forget',adminController.forgetLoad)
router.post('/forget',adminController.forgetVerify)
router.post('/otpverify',adminController.checkOtp)
router.post('/reset',adminController.confirmPasswordCheck,adminController.setResetPassword)

//Admin Logout
router.get('/logout',adminController.adminLogout)

// Admin dashboard
router.get('/adminhome',middlewareController.isAdminLogIn,adminController.dashboardLoad)

//Admin Banners
router.get('/addbanners',middlewareController.isAdminLogIn,adminController.addBanner)
router.post('/addbanners',bannerUpload.single('image'),adminController.bannerImage)
router.get('/activatebanner/:id',middlewareController.isAdminLogIn,adminController.activateBanner)
router.get('/removebanner/:id',middlewareController.isAdminLogIn,adminController.removeBanner)

//Admin product
router.get('/adminproduct',middlewareController.isAdminLogIn,adminController.adminProductLoad)
router.get('/addProduct',middlewareController.isAdminLogIn,adminController.addProductLoad)
router.post('/addProduct',upload.array('image',5),adminController.insertProduct)
router.get('/deleteproduct/',adminController.deleteProduct)
router.get('/editproduct/',adminController.editProductLoad)
router.post('/editProduct/',upload.array('image',5),adminController.editProduct)

//admin category
router.get('/category',middlewareController.isAdminLogIn,adminController.categoryLoad)
router.post('/addcategory',adminController.addCategory)
router.post('/editcategory',adminController.editCategory)
router.get('/delete-category/',middlewareController.isAdminLogIn,adminController.deleteCategory)

//COUPONS
router.get('/coupons',middlewareController.isAdminLogIn,adminController.couponLoad)
router.post('/addcoupon',adminController.addCoupon)
router.post('/editcoupon',adminController.editCoupon)
router.get('/deletecoupon',adminController.deleteCoupon)

//Admin userlist
router.get('/userlist',middlewareController.isAdminLogIn,adminController.usersListLoad)
router.get('/blockuser/',middlewareController.isAdminLogIn,adminController.userBlock)
router.get('/unblockuser',middlewareController.isAdminLogIn,adminController.userUnblock)

//Admin Orders
router.get('/orders',middlewareController.isAdminLogIn,adminController.loadOrders)
router.get('/orderInfo/:id',middlewareController.isAdminLogIn,adminController.orderInfo)
router.post('/statuschange',middlewareController.isAdminLogIn,adminController.updateStatus)

//Admin Order Return
router.get('/return_details',middlewareController.isAdminLogIn,adminController.returnDetails)
router.post('/pickupstatus',middlewareController.isAdminLogIn,adminController.pickupStatus)
router.get('/returninfo/:id',middlewareController.isAdminLogIn,adminController.returnInfo)


module.exports = router;
