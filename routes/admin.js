const adminController=require('../controller/adminController')
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
router.get('/',adminController.isAdminLogout,adminController.adminLoginLoad)
router.post('/',adminController.adminVerify)
router.get('/forget',adminController.forgetLoad)
router.post('/forget',adminController.forgetVerify)
router.post('/otpverify',adminController.checkOtp)
router.post('/reset',adminController.confirmPasswordCheck,adminController.setResetPassword)

//Admin Logout
router.get('/logout',adminController.adminLogout)

// Admin dashboard
router.get('/adminhome',adminController.isAdminLogIn,adminController.dashboardLoad)

//Admin Banners
router.get('/addbanners',adminController.isAdminLogIn,adminController.addBanner)
router.post('/addbanners',bannerUpload.single('image'),adminController.bannerImage)
router.get('/activatebanner/:id',adminController.isAdminLogIn,adminController.activateBanner)
router.get('/removebanner/:id',adminController.isAdminLogIn,adminController.removeBanner)

//Admin product
router.get('/adminproduct',adminController.isAdminLogIn,adminController.adminProductLoad)
router.get('/addProduct',adminController.isAdminLogIn,adminController.addProductLoad)
router.post('/addProduct',upload.array('image',5),adminController.insertProduct)
router.get('/deleteproduct/',adminController.deleteProduct)
router.get('/editproduct/',adminController.editProductLoad)
router.post('/editProduct/',upload.array('image',5),adminController.editProduct)

//admin category
router.get('/category',adminController.isAdminLogIn,adminController.categoryLoad)
router.post('/addcategory',adminController.addCategory)
router.get('/delete-category/',adminController.isAdminLogIn,adminController.deleteCategory)

//Admin userlist
router.get('/userlist',adminController.isAdminLogIn,adminController.usersListLoad)
router.get('/blockuser/',adminController.isAdminLogIn,adminController.userBlock)
router.get('/unblockuser',adminController.isAdminLogIn,adminController.userUnblock)

//Admin Orders
router.get('/orders',adminController.isAdminLogIn,adminController.loadOrders)
router.get('/orderInfo/:id',adminController.isAdminLogIn,adminController.orderInfo)
router.post('/statuschange',adminController.isAdminLogIn,adminController.updateStatus)
router.get('/return_details',adminController.isAdminLogIn,adminController.returnDetails)
router.get('/returninfo/:id',adminController.isAdminLogIn,adminController.returnInfo)


module.exports = router;
